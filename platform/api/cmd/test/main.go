package main

import (
	"fmt"
	"platform/pkg/config"
	"time"
)

func main() {
	// if err := provider.InitCapsule(
	// 	"ghost-train",
	// 	"user-dev",
	// 	"eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJLTnR5OUVGbk5PZUpKZmNLcS13cGRhOHBjc2wxV3hUemNQblJTNVhFUDVjIn0.eyJleHAiOjE3MzcyMjAzOTYsImlhdCI6MTczNzIxODU5NiwianRpIjoiYTM0YWM3ZDctMGJjMS00OTI2LTgyNzUtYzhkN2Y4NTM2OTY0IiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5sb2NhbC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoia3ViZSIsInN1YiI6IjllNTA4MWQyLWVhMzAtNDUxYS1iN2E3LWQ0YjBiNzZhYmI2YiIsInR5cCI6IklEIiwiYXpwIjoia3ViZSIsInNpZCI6IjExZjU4NTFlLTEyNjItNGFhYS04ZjkzLWFhYjYxOGNhMjMzNCIsImF0X2hhc2giOiJSOWxoS0x5VldlUFh4Tld1ZHBCeGFBIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJ1c2VyLWRldiB1c2VyLWRldiIsImdyb3VwcyI6WyJjYXBzdWxlLmNsYXN0aXguaW8iLCJrdWJlLWRldiIsInByb2plY3RjYXBzdWxlLmRldiJdLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ1c2VyLWRldiIsImdpdmVuX25hbWUiOiJ1c2VyLWRldiIsImZhbWlseV9uYW1lIjoidXNlci1kZXYiLCJlbWFpbCI6InVzZXItZGV2QGRvbWFpbi5jb20ifQ.lLk0tOmFohYcIeExA0RRhyV5CVMdd-u928EtLETLJkOhBpP4hYUwEhkXEyPe-36FgkiFSgowFwUl8hTIJF-8qCP10pcpX1kP200CY3OzdKnwlHs0-QTTXDmEZ0ln2AeqbV1OkJI5OXpyHCnPKJlQ9v8sWmlW-t_a2cHEEWRJ1-e26meP27T2heJILD4mfETn9lYb5IZ4putcmYPMC8eTxHo614vVSmf5GBa3PEOmBgSpl-RkbPcYM8qtn1mN06FdbL-Gb2eSxFWkW9WlnQFYSIujBrQS5LpffD7jlHXkWUpD_67dTLU60ZNxRmajsNZJW06JggsS-GxyWqQTkQbF8Q",
	// ).Deploy(); err != nil {
	// 	panic(err)
	// }
	//config.CheckConfig()
	c := config.GetConfig()
	fmt.Printf("%+v", c)
	fmt.Println(time.Now().Add(time.Minute * 10).Unix())
}
