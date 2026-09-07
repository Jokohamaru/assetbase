package dto

import "time"

// CreateAssetRequestRequest payload
type CreateAssetRequestRequest struct {
	AssetCategoryId string `json:"assetCategoryId" binding:"required"`
	Purpose         string `json:"purpose" binding:"required"`
	Description     string `json:"description" binding:"required"`
}

// RejectAssetRequestRequest payload
type RejectAssetRequestRequest struct {
	Reason string `json:"reason" binding:"required"`
}

// FulfillAssetRequestRequest payload
type FulfillAssetRequestRequest struct {
	AssetId      string `json:"assetId" binding:"required"`
	ConditionOut string `json:"conditionOut" binding:"required"`
}

// AssetRequestResponse represents the return payload
type AssetRequestResponse struct {
	ID              string     `json:"id"`
	RequestNo       string     `json:"requestNo"`
	Status          string     `json:"status"`
	Purpose         string     `json:"purpose"`
	Description     string     `json:"description"`
	AssetCategoryId string     `json:"assetCategoryId"`
	AssetCategory   string     `json:"assetCategory"`
	RequestedBy     string     `json:"requestedBy"`
	RequestedByName string     `json:"requestedByName"`
	ApprovedAt      *time.Time `json:"approvedAt,omitempty"`
	RejectionReason *string    `json:"rejectionReason,omitempty"`
	FulfilledAt     *time.Time `json:"fulfilledAt,omitempty"`
	AssignmentId    *string    `json:"assignmentId,omitempty"`
	CreatedAt       time.Time  `json:"createdAt"`
}

// AssetRequestListResponse paginated response
type AssetRequestListResponse struct {
	Data  []AssetRequestResponse `json:"data"`
	Total int                    `json:"total"`
	Page  int                    `json:"page"`
	Limit int                    `json:"limit"`
}
