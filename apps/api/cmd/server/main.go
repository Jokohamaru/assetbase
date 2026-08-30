package main

import (
	"log"
	"os"

	"github.com/Jokohamaru/assetbase/internal/config"
	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/internal/handler"
	"github.com/Jokohamaru/assetbase/internal/middleware"
	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env if exists (for local dev)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using OS env vars")
	}

	// Load Config
	cfg := config.Load()

	// Connect Database
	database.Connect()
	defer database.Disconnect()

	// Seed Initial Admin
	database.SeedInitialAdmin(cfg)

	// Setup Gin
	mode := os.Getenv("GIN_MODE")
	if mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Global Middlewares
	r.Use(middleware.Recovery())
	r.Use(middleware.ErrorHandler())
	r.Use(middleware.CORS(cfg.CORSOrigin))
	r.Use(middleware.Audit())

	// Health Check
	r.GET("/api/health", func(c *gin.Context) {
		response.Success(c, gin.H{
			"status":  "ok",
			"service": "assetbase-api",
		})
	})

	// Setup Services and Handlers
	authService := service.NewAuthService(cfg)
	authHandler := handler.NewAuthHandler(authService)
	
	masterDataService := service.NewMasterDataService()
	masterDataHandler := handler.NewMasterDataHandler(masterDataService)
	
	adminHandler := handler.NewAdminHandler()
	
	assetService := service.NewAssetService()
	assetHandler := handler.NewAssetHandler(assetService)
	
	lifecycleService := service.NewLifecycleService()
	lifecycleHandler := handler.NewLifecycleHandler(lifecycleService)
	
	historyService := service.NewHistoryService()
	historyHandler := handler.NewHistoryHandler(historyService)

	v1 := r.Group("/api/v1")
	{
		// Public routes
		v1.POST("/auth/login", authHandler.Login)
		v1.POST("/auth/logout", authHandler.Logout)

		// Protected routes
		protected := v1.Group("")
		protected.Use(middleware.Auth())
		{
			protected.GET("/auth/me", authHandler.GetMe)
			protected.PUT("/auth/password", authHandler.ChangePassword)
			protected.GET("/history", historyHandler.ListHistory)
			
			// Asset routes
			assets := protected.Group("/assets")
			{
				assets.GET("", assetHandler.ListAssets)
				assets.GET("/:id", assetHandler.GetAsset)
				assets.POST("", assetHandler.CreateAsset)
				
				assets.POST("/:id/assign", lifecycleHandler.AssignAsset)
				assets.POST("/:id/return", lifecycleHandler.ReturnAsset)
				assets.POST("/:id/transfer", lifecycleHandler.TransferAsset)
			}
			
			// Admin routes
			admin := protected.Group("/admin")
			admin.Use(middleware.RequireRole("ADMIN"))
			{
				admin.GET("/departments", masterDataHandler.ListDepartments)
				admin.POST("/departments", masterDataHandler.CreateDepartment)
				
				admin.GET("/locations", masterDataHandler.ListLocations)
				admin.POST("/locations", masterDataHandler.CreateLocation)
				
				admin.GET("/categories", masterDataHandler.ListCategories)
				admin.POST("/categories", masterDataHandler.CreateCategory)
				
				admin.GET("/manufacturers", masterDataHandler.ListManufacturers)
				admin.POST("/manufacturers", masterDataHandler.CreateManufacturer)
				
				admin.GET("/models", masterDataHandler.ListModels)
				admin.POST("/models", masterDataHandler.CreateModel)
				
				admin.GET("/warehouses", masterDataHandler.ListWarehouses)
				admin.POST("/warehouses", masterDataHandler.CreateWarehouse)
				
				admin.GET("/asset-statuses", masterDataHandler.ListAssetStatuses)
				
				admin.GET("/users", adminHandler.ListUsers)
				admin.POST("/users", adminHandler.CreateUser)
				admin.PUT("/users/:id/status", adminHandler.UpdateUserStatus)
			}
		}
	}

	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
