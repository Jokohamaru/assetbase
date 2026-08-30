package dto

import (
	"time"
)

type CreateInventorySessionRequest struct {
	Name              string  `json:"name" binding:"required"`
	ScopeDepartmentID *string `json:"scopeDepartmentId,omitempty"`
	ScopeLocationID   *string `json:"scopeLocationId,omitempty"`
	ScopeWarehouseID  *string `json:"scopeWarehouseId,omitempty"`
	ScopeCategoryID   *string `json:"scopeCategoryId,omitempty"`
}

type ScanInventoryItemRequest struct {
	AssetID             *string `json:"assetId,omitempty"`
	Barcode             *string `json:"barcode,omitempty"`
	SerialNumber        *string `json:"serialNumber,omitempty"`
	ObservedLocationID  *string `json:"observedLocationId,omitempty"`
	ObservedCustodianID *string `json:"observedCustodianId,omitempty"`
	Note                *string `json:"note,omitempty"`
}

type InventorySessionResponse struct {
	ID                string                  `json:"id"`
	InventoryNo       string                  `json:"inventoryNo"`
	Name              string                  `json:"name"`
	Status            string                  `json:"status"`
	ScopeDepartmentID *string                 `json:"scopeDepartmentId,omitempty"`
	ScopeLocationID   *string                 `json:"scopeLocationId,omitempty"`
	ScopeWarehouseID  *string                 `json:"scopeWarehouseId,omitempty"`
	ScopeCategoryID   *string                 `json:"scopeCategoryId,omitempty"`
	StartedAt         time.Time               `json:"startedAt"`
	ClosedAt          *time.Time              `json:"closedAt,omitempty"`
	CreatedBy         string                  `json:"createdBy"`
	Items             []InventoryItemResponse `json:"items,omitempty"`
	CreatedAt         time.Time               `json:"createdAt"`
	UpdatedAt         time.Time               `json:"updatedAt"`
}

type InventoryItemResponse struct {
	ID                  string     `json:"id"`
	SessionID           string     `json:"sessionId"`
	AssetID             string     `json:"assetId"`
	Asset               *AssetResponse `json:"asset,omitempty"`
	ExpectedLocationID  *string    `json:"expectedLocationId,omitempty"`
	ExpectedCustodianID *string    `json:"expectedCustodianId,omitempty"`
	ObservedLocationID  *string    `json:"observedLocationId,omitempty"`
	ObservedCustodianID *string    `json:"observedCustodianId,omitempty"`
	ScannedAt           *time.Time `json:"scannedAt,omitempty"`
	ScannedBy           *string    `json:"scannedBy,omitempty"`
	Result              string     `json:"result"`
	Note                *string    `json:"note,omitempty"`
}
