package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port                 string
	DatabaseURL          string
	JWTSecret            string
	JWTExpiryHours       int
	BcryptCost           int
	CORSOrigin           string
	InitialAdminPassword string
	DemoSeed             bool
}

func Load() *Config {
	expiry, _ := strconv.Atoi(os.Getenv("JWT_EXPIRY_HOURS"))
	if expiry == 0 {
		expiry = 12
	}
	
	cost, _ := strconv.Atoi(os.Getenv("BCRYPT_COST"))
	if cost == 0 {
		cost = 12
	}
	
	seed := os.Getenv("ASSETBASE_DEMO_SEED") == "true"

	return &Config{
		Port:                 os.Getenv("PORT"),
		DatabaseURL:          os.Getenv("DATABASE_URL"),
		JWTSecret:            os.Getenv("JWT_SECRET"),
		JWTExpiryHours:       expiry,
		BcryptCost:           cost,
		CORSOrigin:           os.Getenv("CORS_ORIGIN"),
		InitialAdminPassword: os.Getenv("INITIAL_ADMIN_PASSWORD"),
		DemoSeed:             seed,
	}
}
