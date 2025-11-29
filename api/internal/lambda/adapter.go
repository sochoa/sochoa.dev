package lambda

import (
	"bytes"
	"context"
	"io"
	"log/slog"
	"net/http/httptest"
	"net/url"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/gin-gonic/gin"
)

// HandlerAdapter adapts a Gin engine to handle Lambda HTTP API events
type HandlerAdapter struct {
	engine *gin.Engine
	log    *slog.Logger
}

// NewHandlerAdapter creates a new Lambda adapter for a Gin engine
func NewHandlerAdapter(engine *gin.Engine, log *slog.Logger) *HandlerAdapter {
	return &HandlerAdapter{
		engine: engine,
		log:    log,
	}
}

// Handle converts Lambda HTTP API event to HTTP request, processes it, and returns Lambda response
func (a *HandlerAdapter) Handle(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// Log incoming request
	a.log.Debug("lambda event",
		slog.String("method", request.HTTPMethod),
		slog.String("path", request.Path),
		slog.Int("query_params", len(request.QueryStringParameters)),
	)

	// Create HTTP request from Lambda event
	path := request.Path

	// Reconstruct query string from QueryStringParameters if present
	if len(request.QueryStringParameters) > 0 {
		queryValues := url.Values{}
		for key, value := range request.QueryStringParameters {
			queryValues.Set(key, value)
		}
		if encodedQuery := queryValues.Encode(); encodedQuery != "" {
			path = path + "?" + encodedQuery
		}
	}

	// Handle request body
	var body io.Reader = strings.NewReader("")
	if request.Body != "" {
		// Check if body is base64 encoded
		if request.IsBase64Encoded {
			// Decode base64 if needed (typically for binary data)
			// For text body, AWS Lambda handles this for us
			body = strings.NewReader(request.Body)
		} else {
			body = strings.NewReader(request.Body)
		}
	}

	// Create HTTP request
	httpRequest := httptest.NewRequest(
		request.HTTPMethod,
		path,
		body,
	)

	// Copy headers from Lambda event to HTTP request
	for key, value := range request.Headers {
		// API Gateway lowercases header names
		httpRequest.Header.Set(key, value)
	}

	// Add authorization header if present (comes separately from API Gateway)
	if request.RequestContext.Authorizer != nil {
		if auth, ok := request.RequestContext.Authorizer["authorization"]; ok {
			if authStr, ok := auth.(string); ok {
				httpRequest.Header.Set("Authorization", authStr)
			}
		}
	}

	// Set request context
	httpRequest = httpRequest.WithContext(ctx)

	// Create response recorder to capture response
	responseRecorder := httptest.NewRecorder()

	// Process request through Gin
	a.engine.ServeHTTP(responseRecorder, httpRequest)

	// Get response from recorder
	result := responseRecorder.Result()
	defer result.Body.Close()

	// Read response body
	responseBody, err := io.ReadAll(result.Body)
	if err != nil {
		a.log.Error("failed to read response body", slog.String("error", err.Error()))
		return lambdaErrorResponse(500, "Failed to read response"), nil
	}

	// Build response headers (convert Header map)
	responseHeaders := make(map[string]string)
	for key, values := range result.Header {
		if len(values) > 0 {
			responseHeaders[key] = values[0]
		}
	}

	// Log response
	a.log.Debug("lambda response",
		slog.Int("status_code", result.StatusCode),
		slog.Int("body_size", len(responseBody)),
	)

	// Return Lambda response
	return events.APIGatewayProxyResponse{
		StatusCode:      result.StatusCode,
		Headers:         responseHeaders,
		Body:            string(responseBody),
		IsBase64Encoded: false,
	}, nil
}

// lambdaErrorResponse creates a standard Lambda error response
func lambdaErrorResponse(statusCode int, message string) events.APIGatewayProxyResponse {
	// Build JSON error response
	var buf bytes.Buffer
	buf.WriteString(`{"error":"`)
	buf.WriteString(message)
	buf.WriteString(`"}`)

	return events.APIGatewayProxyResponse{
		StatusCode: statusCode,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
		Body:            buf.String(),
		IsBase64Encoded: false,
	}
}
