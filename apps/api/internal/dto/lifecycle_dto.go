package dto

type AssignAssetRequest struct {
	Type               string  `json:"type" binding:"required"` // ASSIGNMENT or LOAN
	AssignedToId       string  `json:"assignedToId" binding:"required"`
	DepartmentId       string  `json:"departmentId" binding:"required"`
	LocationId         string  `json:"locationId" binding:"required"`
	ExpectedReturnDate *string `json:"expectedReturnDate"` // YYYY-MM-DD format
	ConditionOut       string  `json:"conditionOut" binding:"required"`
	Note               *string `json:"note"`
}

type ReturnAssetRequest struct {
	WarehouseId *string `json:"warehouseId"`
	LocationId  string  `json:"locationId" binding:"required"`
	ConditionIn string  `json:"conditionIn" binding:"required"`
	Outcome     string  `json:"outcome" binding:"required"` // READY, MAINTENANCE, BROKEN
	Note        *string `json:"note"`
}

type TransferAssetRequest struct {
	ToLocationId  string  `json:"toLocationId" binding:"required"`
	ToWarehouseId *string `json:"toWarehouseId"`
	Condition     *string `json:"condition"`
	Reason        string  `json:"reason" binding:"required"`
}

type MaintenanceRequest struct {
	WarehouseId *string `json:"warehouseId"`
	Issue       string  `json:"issue" binding:"required"`
	Cost        *float64 `json:"cost"`
}

type MaintenanceCompletionRequest struct {
	Resolution string  `json:"resolution" binding:"required"`
	Outcome    string  `json:"outcome" binding:"required"` // READY, BROKEN, DISPOSED
	Cost       *float64 `json:"cost"`
}
