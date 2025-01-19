package models

import "time"

type Lecture struct {
	ID          string `json:"urlId,omitempty" gorm:"primaryKey"`
	CourseID    string `json:"-"`
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	Text        string `json:"text,omitempty"`
}

type Material struct {
	ID       uint   `json:"-" gorm:"primaryKey"`
	CourseID string `json:"-"`
	Title    string `json:"title,omitempty"`
	Link     string `json:"link,omitempty"`
}

type LectureStatus struct {
	ID        uint    `gorm:"primaryKey" json:"urlId,omitempty"`
	UserID    uint    `gorm:"not null"`
	User      User    `gorm:"constraint:OnDelete:CASCADE"`
	LectureID string  `gorm:"not null"`
	Lecture   Lecture `gorm:"constraint:OnDelete:CASCADE"`
	Status    string  `gorm:"type:varchar(50);not null"` // Например, "completed", "in-progress", "not-started"
	UpdatedAt time.Time
}
