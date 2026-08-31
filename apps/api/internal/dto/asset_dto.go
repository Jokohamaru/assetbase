package dto

type CreateAssetRequest struct {
	AssetTag       string  `json:"assetTag" binding:"required"`
	Name           string  `json:"name" binding:"required"`
	Barcode        *string `json:"barcode"` // Optional now
	SerialNumber   *string `json:"serialNumber"`
	CategoryId     string  `json:"categoryId" binding:"required"`
	ModelId        *string `json:"modelId"`
	ManufacturerId *string `json:"manufacturerId"`
	StatusId       string  `json:"statusId" binding:"required"`
	DepartmentId   *string `json:"departmentId"`
	LocationId     *string `json:"locationId"`
	WarehouseId    *string `json:"warehouseId"`
	PurchaseCost   *float64 `json:"purchaseCost"`
	WarrantyMonths *int    `json:"warrantyMonths"`
	Cpu            *string `json:"cpu"`
	Ram            *string `json:"ram"`
	Storage        *string `json:"storage"`
	OperatingSystem *string `json:"operatingSystem"`
	IpAddress      *string `json:"ipAddress"`
	MacAddress     *string `json:"macAddress"`
	Notes          *string `json:"notes"`
	ImageUrl       *string `json:"imageUrl"`
}

type UpdateAssetRequest struct {
	Name           *string `json:"name"`
	Barcode        *string `json:"barcode"`
	SerialNumber   *string `json:"serialNumber"`
	CategoryId     *string `json:"categoryId"`
	ModelId        *string `json:"modelId"`
	ManufacturerId *string `json:"manufacturerId"`
	StatusId       *string `json:"statusId"`
	DepartmentId   *string `json:"departmentId"`
	LocationId     *string `json:"locationId"`
	WarehouseId    *string `json:"warehouseId"`
	PurchaseCost   *float64 `json:"purchaseCost"`
	WarrantyMonths *int    `json:"warrantyMonths"`
	Cpu            *string `json:"cpu"`
	Ram            *string `json:"ram"`
	Storage        *string `json:"storage"`
	OperatingSystem *string `json:"operatingSystem"`
	IpAddress      *string `json:"ipAddress"`
	MacAddress     *string `json:"macAddress"`
	Notes          *string `json:"notes"`
	ImageUrl       *string `json:"imageUrl"`
}

type AssetResponse struct {
	ID                 string  `json:"id"`
	AssetTag           string  `json:"assetTag"`
	Name               string  `json:"name"`
	Barcode            *string `json:"barcode"`
	SerialNumber       *string `json:"serialNumber"`
	CategoryId         string  `json:"categoryId"`
	CategoryName       string  `json:"categoryName,omitempty"`
	ModelId            *string `json:"modelId"`
	ModelName          string  `json:"modelName,omitempty"`
	ManufacturerId     *string `json:"manufacturerId"`
	ManufacturerName   string  `json:"manufacturerName,omitempty"`
	StatusId           string  `json:"statusId"`
	StatusName         string  `json:"statusName,omitempty"`
	StatusColor        string  `json:"statusColor,omitempty"`
	AssignedUserId     *string `json:"assignedUserId"`
	CurrentCustodianId *string `json:"currentCustodianId"`
	DepartmentId       *string `json:"departmentId"`
	LocationId         *string `json:"locationId"`
	WarehouseId        *string `json:"warehouseId"`
	PurchaseCost       *float64 `json:"purchaseCost"`
	WarrantyMonths     *int    `json:"warrantyMonths"`
	Cpu                *string `json:"cpu"`
	Ram                *string `json:"ram"`
	Storage            *string `json:"storage"`
	OperatingSystem    *string `json:"operatingSystem"`
	IpAddress          *string `json:"ipAddress"`
	MacAddress         *string `json:"macAddress"`
	Notes              *string `json:"notes"`
	ImageUrl           *string `json:"imageUrl"`
	CreatedAt          string  `json:"createdAt"`
	UpdatedAt          string  `json:"updatedAt"`
}
