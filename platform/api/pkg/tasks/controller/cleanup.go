package controller

import (
	"fmt"
	"platform/pkg/tasks/provider"
	"time"
)

type CleanupController struct {
	MaxAge   time.Duration // Максимальный срок жизни tenant
	Interval time.Duration // Интервал проверки
}

func InitCleanupController(maxAge, interval time.Duration) *CleanupController {
	return &CleanupController{
		MaxAge:   maxAge,
		Interval: interval,
	}
}
func (c *CleanupController) Run() {
	fmt.Println("Tenant cleanup controller started.")
	ticker := time.NewTicker(c.Interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			c.cleanupTenants()
		}
	}
}
func (c *CleanupController) cleanupTenants() {
	tenants, err := provider.InitCapsule(nil, "").TenantList()
	if err != nil {
		fmt.Println(err)
	}
	now := time.Now()

	for _, tenant := range tenants.Items {
		// Пример получения времени создания tenant
		createdAt := tenant.CreationTimestamp.Time
		if now.Sub(createdAt) > c.MaxAge {
			if err := c.deleteTenant(tenant.Name); err != nil {
				fmt.Printf("Error deleting tenant %s: %v", tenant, err)
			} else {
				fmt.Printf("Tenant %s deleted successfully\n", tenant)
			}
		}
	}
}

func (c *CleanupController) deleteTenant(tenantName string) error {
	return provider.InitCapsule(nil, "").Destroy()
}
