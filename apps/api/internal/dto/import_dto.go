package dto

import "time"

// ImportAssetRow represents the expected payload for each row in the Excel/CSV file
type ImportAssetRow struct {
	AssetTag           string  `json:"assetTag"`
	Name               string  `json:"name"`
	SerialNumber       string  `json:"serialNumber,omitempty"`
	Barcode            string  `json:"barcode,omitempty"`
	CategoryCode       string  `json:"categoryCode"`
	ModelName          string  `json:"modelName,omitempty"`
	ManufacturerName   string  `json:"manufacturerName,omitempty"`
	DepartmentCode     string  `json:"departmentCode,omitempty"`
	LocationCode       string  `json:"locationCode,omitempty"`
	WarehouseCode      string  `json:"warehouseCode,omitempty"`
	StatusCode         string  `json:"statusCode"`
	PurchaseCost       float64 `json:"purchaseCost,omitempty"`
	PurchaseDateStr    string  `json:"purchaseDate,omitempty"`
	WarrantyExpiryStr  string  `json:"warrantyExpiryDate,omitempty"`
}

type ImportRowError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type ImportBatchResponse struct {
	ID             string    `json:"id"`
	SourceFileName string    `json:"sourceFileName"`
	Status         string    `json:"status"`
	TotalRows      int       `json:"totalRows"`
	ValidRows      int       `json:"validRows"`
	InvalidRows    int       `json:"invalidRows"`
	CommittedRows  int       `json:"committedRows"`
	CreatedAt      time.Time `json:"createdAt"`
	CreatedBy      string    `json:"createdBy"`
}

type ImportRowResponse struct {
	ID        string           `json:"id"`
	BatchID   string           `json:"batchId"`
	RowNumber int              `json:"rowNumber"`
	Payload   ImportAssetRow   `json:"payload"`
	Status    string           `json:"status"`
	Errors    []ImportRowError `json:"errors"`
}
