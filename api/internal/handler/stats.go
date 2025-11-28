package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/sochoa/sochoa.dev/api/internal/middleware"
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
func (h *StatsHandler) RecordStats(w http.ResponseWriter, r *http.Request) {
	// In production, this would validate a signed key header from CloudWatch or metrics service
	// For now, we'll accept any request if admin is authenticated
	user := middleware.UserFromContext(r)
	if user == nil || !user.IsAdmin() {
		writeJSONError(w, http.StatusForbidden, "access denied")
		return
	}

	var req RecordStatsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid request body")
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

	if err := h.statsRepo.Create(r.Context(), stat); err != nil {
		status, message := statusCodeFromError(err)
		writeJSONError(w, status, message)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(view.ToVisitorStatResponse(stat))
}

// GetStats handles GET /api/stats/:id (admin only)
func (h *StatsHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r)
	if user == nil || !user.IsAdmin() {
		writeJSONError(w, http.StatusForbidden, "admin role required")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeJSONError(w, http.StatusBadRequest, "id is required")
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid id format")
		return
	}

	stat, err := h.statsRepo.GetByID(r.Context(), id)
	if err != nil {
		status, message := statusCodeFromError(err)
		writeJSONError(w, status, message)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(view.ToVisitorStatResponse(stat))
}

// ListStatsByDateRange handles GET /api/stats (admin only)
func (h *StatsHandler) ListStatsByDateRange(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r)
	if user == nil || !user.IsAdmin() {
		writeJSONError(w, http.StatusForbidden, "admin role required")
		return
	}

	startDateStr := r.URL.Query().Get("start_date")
	endDateStr := r.URL.Query().Get("end_date")

	if startDateStr == "" || endDateStr == "" {
		writeJSONError(w, http.StatusBadRequest, "start_date and end_date are required")
		return
	}

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid start_date format (use YYYY-MM-DD)")
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid end_date format (use YYYY-MM-DD)")
		return
	}

	limit, offset := parsePagination(r)

	stats, err := h.statsRepo.ListByDateRange(r.Context(), startDate, endDate, limit, offset)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to list stats")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(view.ToVisitorStatResponses(stats))
}

// ListStatsByPage handles GET /api/stats/page/:page_path (admin only)
func (h *StatsHandler) ListStatsByPage(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r)
	if user == nil || !user.IsAdmin() {
		writeJSONError(w, http.StatusForbidden, "admin role required")
		return
	}

	pagePath := r.PathValue("page_path")
	if pagePath == "" {
		writeJSONError(w, http.StatusBadRequest, "page_path is required")
		return
	}

	limit, offset := parsePagination(r)

	stats, err := h.statsRepo.ListByPage(r.Context(), pagePath, limit, offset)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to list stats")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(view.ToVisitorStatResponses(stats))
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
func (h *StatsHandler) UpdateStats(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r)
	if user == nil || !user.IsAdmin() {
		writeJSONError(w, http.StatusForbidden, "admin role required")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeJSONError(w, http.StatusBadRequest, "id is required")
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid id format")
		return
	}

	stat, err := h.statsRepo.GetByID(r.Context(), id)
	if err != nil {
		status, message := statusCodeFromError(err)
		writeJSONError(w, status, message)
		return
	}

	var req UpdateStatsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	stat.Pageviews = req.Pageviews
	stat.UniqueVisitors = req.UniqueVisitors
	stat.LatencyP50 = req.LatencyP50
	stat.LatencyP95 = req.LatencyP95
	stat.LatencyP99 = req.LatencyP99
	stat.Errors4xx = req.Errors4xx
	stat.Errors5xx = req.Errors5xx

	if err := h.statsRepo.Update(r.Context(), stat); err != nil {
		status, message := statusCodeFromError(err)
		writeJSONError(w, status, message)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(view.ToVisitorStatResponse(stat))
}
