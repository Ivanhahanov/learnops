package utils

import (
	"os"
	"strconv"
	"time"
)

func GetIntEnv(env string, value int) (int, error) {
	val := os.Getenv(env)
	if val == "" {
		return value, nil
	}
	return strconv.Atoi(val)
}

func MustDuration(v int, err error) time.Duration {
	if err != nil {
		panic(err)
	}
	return time.Duration(v)
}
