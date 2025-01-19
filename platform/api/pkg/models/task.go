package models

import "time"

type Task struct {
	CourseID    string
	ID          string `json:"urlId,omitempty" gorm:"primaryKey"`
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	Readme      string `json:"readme,omitempty"`
	Hint        string `json:"hint,omitempty"`
	Validator   string `json:"validator,omitempty"`
}

type TaskStatus struct {
	ID        uint   `gorm:"primaryKey" json:"urlId,omitempty"`
	UserID    uint   `gorm:"not null"`
	User      User   `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	TaskID    string `gorm:"not null"`
	Task      Task   `gorm:"foreignKey:TaskID;constraint:OnDelete:CASCADE"`
	Status    string `gorm:"type:varchar(50);not null"` // Например, "completed", "in-progress", "not-started"
	UpdatedAt time.Time
}
