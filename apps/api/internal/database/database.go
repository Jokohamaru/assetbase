package database

import (
	"log"

	"github.com/Jokohamaru/assetbase/prisma/db"
)

var Client *db.PrismaClient

func Connect() {
	Client = db.NewClient()
	if err := Client.Prisma.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Connected to database successfully")
}

func Disconnect() {
	if Client != nil {
		if err := Client.Prisma.Disconnect(); err != nil {
			log.Printf("Failed to disconnect from database: %v", err)
		}
	}
}
