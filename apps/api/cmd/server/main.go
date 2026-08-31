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

	inventoryService := service.NewInventoryService()
	inventoryHandler := handler.NewInventoryHandler(inventoryService)

	importService := service.NewImportService()
	importHandler := handler.NewImportHandler(importService)

	incidentService := service.NewIncidentService()
	incidentHandler := handler.NewIncidentHandler(incidentService)

	digitalService := service.NewDigitalService()
	digitalHandler := handler.NewDigitalHandler(digitalService)

	vendorService := service.NewVendorService()
	vendorHandler := handler.NewVendorHandler(vendorService)

	riskService := service.NewRiskService()
	riskHandler := handler.NewRiskHandler(riskService)

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
			
			// Inventory routes
			inventories := protected.Group("/inventories")
			{
				inventories.GET("", inventoryHandler.ListSessions)
				inventories.GET("/:id", inventoryHandler.GetSession)
				inventories.POST("", inventoryHandler.CreateSession)
				inventories.POST("/:id/scan", inventoryHandler.ScanItem)
				inventories.PUT("/:id/close", inventoryHandler.CloseSession)
			}
			
			// Import routes
			imports := protected.Group("/imports")
			{
				imports.GET("", importHandler.ListBatches)
				imports.GET("/:id", importHandler.GetBatch)
				imports.GET("/:id/rows", importHandler.GetBatchRows)
				imports.POST("/upload", importHandler.UploadFile)
				imports.POST("/:id/commit", importHandler.CommitBatch)
				imports.POST("/:id/rollback", importHandler.RollbackBatch)
			}

			// Incident routes
			incidents := protected.Group("/incidents")
			{
				incidents.GET("", incidentHandler.ListIncidents)
				incidents.POST("", incidentHandler.CreateIncident)
				incidents.GET("/:id", incidentHandler.GetIncident)
				incidents.PUT("/:id/status", incidentHandler.UpdateStatus)
				incidents.PUT("/:id/assign", incidentHandler.AssignIncident)
			}

			// Digital Entitlements routes
			entitlements := protected.Group("/entitlements")
			{
				entitlements.GET("", digitalHandler.ListEntitlements)
				entitlements.POST("", digitalHandler.CreateEntitlement)
				entitlements.GET("/:id", digitalHandler.GetEntitlement)
				entitlements.POST("/:id/assignments", digitalHandler.AssignEntitlement)
				entitlements.PATCH("/:id/assignments/:aId", digitalHandler.RevokeAssignment)
				entitlements.POST("/:id/renewals", digitalHandler.RenewEntitlement)
			}
			
			// Vendors routes
			vendors := protected.Group("/vendors")
			{
				vendors.POST("", vendorHandler.CreateVendor)
				vendors.GET("", vendorHandler.ListVendors)
				vendors.GET("/:id", vendorHandler.GetVendor)
				vendors.PUT("/:id", vendorHandler.UpdateVendor)
				vendors.POST("/:id/evaluate", vendorHandler.EvaluateVendor)
			}
			
			// Risk Assessment routes
			risks := protected.Group("/risk-assessments")
			{
				risks.POST("", riskHandler.CreateAssessment)
				risks.GET("", riskHandler.ListAssessments)
				risks.GET("/:id", riskHandler.GetAssessment)
				risks.PUT("/:id/status", riskHandler.UpdateAssessmentStatus)
				risks.POST("/:id/items", riskHandler.CreateRiskItem)
			}

			riskItems := protected.Group("/risk-items")
			{
				riskItems.PUT("/:itemId/treatment", riskHandler.UpdateRiskTreatment)
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
