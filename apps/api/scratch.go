package main

import (
	"context"
	"fmt"
	"log"

	"github.com/Jokohamaru/assetbase/internal/config"
	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {}
	config.Load()
	database.Connect()
	defer database.Disconnect()

	// Try fetching all assets count
	count, err := database.Client.Asset.FindMany().Count(context.Background())
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Total count: %v\n", count)
}
