package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "api",
	Short: "sochoa.dev API - personal website backend",
	Long:  "sochoa.dev API is a REST API for a personal website with blog, guestbook, and analytics",
	Run: func(_ *cobra.Command, _ []string) {
		fmt.Println("sochoa.dev API - under construction")
	},
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
}
