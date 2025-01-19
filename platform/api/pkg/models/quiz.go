package models

import "time"

type Test struct {
	ID          uint        `json:"-" gorm:"primaryKey"`
	CourseID    string      `json:"-"`
	Title       string      `json:"title,omitempty"`
	Description string      `json:"description,omitempty"`
	LinkedTask  string      `json:"linkedTask,omitempty"`
	Questions   []*Question `json:"questions,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

type Question struct {
	ID      uint      `json:"-" gorm:"primaryKey"`
	TestID  uint      `json:"-"`
	Type    string    `json:"type,omitempty"`
	Text    string    `json:"text,omitempty"`
	Options []*Option `json:"options,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

type Option struct {
	ID         uint   `json:"-" gorm:"primaryKey"`
	QuestionID uint   `json:"-"`
	Option     string `json:"option,omitempty"`
	IsRight    bool   `json:"is_right,omitempty"`
}

type TestStatus struct {
	ID        uint   `gorm:"primaryKey"`
	UserID    uint   `gorm:"not null"`
	User      User   `gorm:"constraint:OnDelete:CASCADE"`
	TestID    string `gorm:"not null"`
	Test      Test   `gorm:"constraint:OnDelete:CASCADE"`
	Status    string `gorm:"type:varchar(50);not null"` // Например, "completed", "in-progress", "not-started"
	UpdatedAt time.Time
}
