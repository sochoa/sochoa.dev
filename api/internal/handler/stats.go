package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sochoa/sochoa.dev/api/internal/auth"
	"github.com/sochoa/sochoa.dev/api/internal/model"
	"github.com/sochoa/sochoa.dev/api/internal/view"
)

// StatsHandler handles stats-related HTTP requests
type StatsHandler struct {
	statsRepo *model.StatsRepository
}

// NewStatsHandler creates a new stats handler
func NewStatsHandler(statsRepo *model.StatsRepository) *StatsHandler {
	return &StatsHandler{
		statsRepo: statsRepo,
	}
}

// RecordStatsRequest represents the request body for recording stats
type RecordStatsRequest struct {
	Date           time.Time  `json:"date"`
	PagePath       string     `json:"page_path"`
	Country        *string    `json:"country,omitempty"`
	ReferrerDomain *string    `json:"referrer_domain,omitempty"`
	Pageviews      int        `json:"pageviews"`
	UniqueVisitors int        `json:"unique_visitors"`
	LatencyP50     *float64   `json:"latency_p50,omitempty"`
	LatencyP95     *float64   `json:"latency_p95,omitempty"`
	LatencyP99     *float64   `json:"latency_p99,omitempty"`
	Errors4xx      int        `json:"errors_4xx"`
	Errors5xx      int        `json:"errors_5xx"`
}

// RecordStats handles POST /api/stats (internal metrics intake, requires signed header)
func (h *StatsHandler) RecordStats(c *gin.Context) {
	// In production, this would validate a signed key header from CloudWatch or metrics service
	// For now, we'll accept any request if admin is authenticated
	user := c.MustGet("user").(*auth.User)
	if user == nil || !user.IsAdmin() {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	var req RecordStatsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	stat := &model.VisitorStat{
		Date:           req.Date,
		PagePath:       req.PagePath,
		Country:        req.Country,
		ReferrerDomain: req.ReferrerDomain,
		Pageviews:      req.Pageviews,
		UniqueVisitors: req.UniqueVisitors,
		LatencyP50:     req.LatencyP50,
		LatencyP95:     req.LatencyP95,
		LatencyP99:     req.LatencyP99,
		Errors4xx:      req.Errors4xx,
		Errors5xx:      req.Errors5xx,
	}

	if err := h.statsRepo.Create(c, stat); err != nil {
		status, message := statusCodeFromError(err)
		c.JSON(status, gin.H{"error": message})
		return
	}

	c.JSON(http.StatusCreated, view.ToVisitorStatResponse(stat))
}

// GetStats handles GET /api/stats/:id (admin only)
func (h *StatsHandler) GetStats(c *gin.Context) {
	user := c.MustGet("user").(*auth.User)
	if user == nil || !user.IsAdmin() {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin role required"})
		return
	}

	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id format"})
		return
	}

	stat, err := h.statsRepo.GetByID(c, id)
	if err != nil {
		status, message := statusCodeFromError(err)
		c.JSON(status, gin.H{"error": message})
		return
	}

	c.JSON(http.StatusOK, view.ToVisitorStatResponse(stat))
}

// ListStatsByDateRange handles GET /api/stats (admin only)
func (h *StatsHandler) ListStatsByDateRange(c *gin.Context) {
	user := c.MustGet("user").(*auth.User)
	if user == nil || !user.IsAdmin() {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin role required"})
		return
	}

	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	if startDateStr == "" || endDateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "start_date and end_date are required"})
		return
	}

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_date format (use YYYY-MM-DD)"})
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_date format (use YYYY-MM-DD)"})
		return
	}

	limit, offset := parsePaginationGin(c)

	stats, err := h.statsRepo.ListByDateRange(c, startDate, endDate, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list stats"})
		return
	}

	c.JSON(http.StatusOK, view.ToVisitorStatResponses(stats))
}

// ListStatsByPage handles GET /api/stats/page/:page_path (admin only)
func (h *StatsHandler) ListStatsByPage(c *gin.Context) {
	user := c.MustGet("user").(*auth.User)
	if user == nil || !user.IsAdmin() {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin role required"})
		return
	}

	pagePath := c.Param("page_path")
	if pagePath == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "page_path is required"})
		return
	}

	limit, offset := parsePaginationGin(c)

	stats, err := h.statsRepo.ListByPage(c, pagePath, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list stats"})
		return
	}

	c.JSON(http.StatusOK, view.ToVisitorStatResponses(stats))
}

// UpdateStatsRequest represents the request body for updating stats
type UpdateStatsRequest struct {
	Pageviews      int        `json:"pageviews"`
	UniqueVisitors int        `json:"unique_visitors"`
	LatencyP50     *float64   `json:"latency_p50,omitempty"`
	LatencyP95     *float64   `json:"latency_p95,omitempty"`
	LatencyP99     *float64   `json:"latency_p99,omitempty"`
	Errors4xx      int        `json:"errors_4xx"`
	Errors5xx      int        `json:"errors_5xx"`
}

// UpdateStats handles PUT /api/stats/:id (admin only)
func (h *StatsHandler) UpdateStats(c *gin.Context) {
	user := c.MustGet("user").(*auth.User)
	if user == nil || !user.IsAdmin() {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin role required"})
		return
	}

	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id format"})
		return
	}

	stat, err := h.statsRepo.GetByID(c, id)
	if err != nil {
		status, message := statusCodeFromError(err)
		c.JSON(status, gin.H{"error": message})
		return
	}

	var req UpdateStatsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	stat.Pageviews = req.Pageviews
	stat.UniqueVisitors = req.UniqueVisitors
	stat.LatencyP50 = req.LatencyP50
	stat.LatencyP95 = req.LatencyP95
	stat.LatencyP99 = req.LatencyP99
	stat.Errors4xx = req.Errors4xx
	stat.Errors5xx = req.Errors5xx

	if err := h.statsRepo.Update(c, stat); err != nil {
		status, message := statusCodeFromError(err)
		c.JSON(status, gin.H{"error": message})
		return
	}

	c.JSON(http.StatusOK, view.ToVisitorStatResponse(stat))
}
