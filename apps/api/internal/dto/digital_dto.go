package dto

import "time"

type CreateEntitlementRequest struct {
	Code                 string     `json:"code" binding:"required"`
	Name                 string     `json:"name" binding:"required"`
	Type                 string     `json:"type" binding:"required"` // SOFTWARE, SSL, DOMAIN, OTHER
	ProductName          string     `json:"productName"`
	Edition              string     `json:"edition"`
	SubscriptionIdentifier string   `json:"subscriptionIdentifier"`
	DomainName           string     `json:"domainName"`
	CommonName           string     `json:"commonName"`
	Registrar            string     `json:"registrar"`
	Issuer               string     `json:"issuer"`
	LicenseMetric        string     `json:"licenseMetric"`
	TotalQuantity        int        `json:"totalQuantity" binding:"required,min=1"`
	StartDate            *time.Time `json:"startDate"`
	ExpiryDate           *time.Time `json:"expiryDate"`
	AutoRenew            bool       `json:"autoRenew"`
	RenewalPeriodMonths  int        `json:"renewalPeriodMonths"`
	PurchaseCost         *float64   `json:"purchaseCost"`
	RenewalCost          *float64   `json:"renewalCost"`
	Currency             string     `json:"currency"`
	PurchaseOrderNo      string     `json:"purchaseOrderNo"`
	ContractNo           string     `json:"contractNo"`
	ManagementUrl        string     `json:"managementUrl"`
	Notes                string     `json:"notes"`
	VendorId             string     `json:"vendorId"` // Optional
	OwnerDepartmentId    string     `json:"ownerDepartmentId"` // Optional
}

type AssignEntitlementRequest struct {
	PersonId       string `json:"personId"` // Optional
	AssetId        string `json:"assetId"`  // Optional
	DepartmentId   string `json:"departmentId"` // Optional
	Quantity       int    `json:"quantity" binding:"required,min=1"`
	AssignmentNote string `json:"assignmentNote"`
}

type RenewEntitlementRequest struct {
	NewExpiryDate   time.Time `json:"newExpiryDate" binding:"required"`
	Amount          *float64  `json:"amount"`
	Currency        string    `json:"currency"`
	PurchaseOrderNo string    `json:"purchaseOrderNo"`
	InvoiceNo       string    `json:"invoiceNo"`
	Notes           string    `json:"notes"`
}
