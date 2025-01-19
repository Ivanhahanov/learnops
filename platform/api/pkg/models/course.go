package models

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Course struct {
	ID          string         `json:"urlId,omitempty" gorm:"primaryKey"`
	Title       string         `json:"title,omitempty"`
	Description string         `json:"description,omitempty"`
	Difficulty  string         `json:"difficulty,omitempty"`
	Category    string         `json:"category,omitempty"`
	Tags        pq.StringArray `gorm:"type:text[]" json:"tags"`
	Tasks       []*Task        `json:"tasks,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	Lectures    []*Lecture     `json:"lectures,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	Materials   []*Material    `json:"materials,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	Tests       []*Test        `json:"tests,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

type UsersCourse struct {
	gorm.Model
	UserID   uint
	User     User
	CourseID string `json:"-"`
	Course   Course `json:"course"`
}
