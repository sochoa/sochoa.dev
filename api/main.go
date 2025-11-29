package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/spf13/cobra"
	"github.com/sochoa/sochoa.dev/api/internal/auth"
	"github.com/sochoa/sochoa.dev/api/internal/config"
	"github.com/sochoa/sochoa.dev/api/internal/db"
	"github.com/sochoa/sochoa.dev/api/internal/handler"
	"github.com/sochoa/sochoa.dev/api/internal/logger"
	"github.com/sochoa/sochoa.dev/api/internal/model"
	_ "github.com/sochoa/sochoa.dev/api/docs"
)

var (
	port string

	rootCmd = &cobra.Command{
		Use:   "api",
		Short: "sochoa.dev API - personal website backend",
		Long:  "sochoa.dev API is a REST API for a personal website with blog, guestbook, and analytics",
		RunE:  serve,
	}
)

func init() {
	rootCmd.Flags().StringVar(&port, "port", "8080", "Port to listen on")
}

func serve(_ *cobra.Command, _ []string) error {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to load config: %v\n", err)
		return err
	}

	// Initialize logger
	log := logger.Setup(cfg.LogLevel)

	// Configure Gin mode (release mode disables debug logging)
	if cfg.DevMode {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize database
	database, err := db.Connect(context.Background(), cfg.DBDsn)
	if err != nil {
		log.Error("failed to initialize database", slog.String("error", err.Error()))
		return err
	}
	defer database.Close()

	// Run migrations
	if err := db.MigrateUp(context.Background(), database); err != nil {
		log.Error("failed to run migrations", slog.String("error", err.Error()))
		return err
	}
	log.Info("database migrations completed")

	// Initialize repositories
	postRepo := model.NewPostRepository(database)
	guestbookRepo := model.NewGuestbookRepository(database)
	contactRepo := model.NewContactRepository(database)
	statsRepo := model.NewStatsRepository(database)

	// Initialize token verifier
	tokenVerifier := auth.NewCognitoVerifier(cfg.CognitoUserPoolID, cfg.AWSRegion)

	// Create router and register routes
	apiRouter := handler.NewRouter(
		log,
		tokenVerifier,
		postRepo,
		guestbookRepo,
		contactRepo,
		statsRepo,
	)
	ginEngine := apiRouter.Register()

	// Create HTTP server
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      ginEngine,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Info("starting server", slog.String("address", server.Addr))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Error("server error", slog.String("error", err.Error()))
		}
	}()

	// Wait for interrupt signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	// Graceful shutdown
	log.Info("shutting down server")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Error("failed to shutdown server gracefully", slog.String("error", err.Error()))
		return err
	}

	log.Info("server stopped")
	return nil
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
}
