package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/urfave/cli/v3"
)

func main() {
	cmd := &cli.Command{
		Commands: []*cli.Command{
			{
				Name:  "upload",
				Usage: "upload courses",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:    "config",
						Aliases: []string{"c"},
						Usage:   "config path",
					},
					&cli.StringFlag{
						Name:    "host",
						Aliases: []string{"H"},
						Usage:   "host address",
						Value:   "http://learnops.local",
					},
				},
				Action: func(ctx context.Context, cmd *cli.Command) error {
					config, err := filepath.Abs(cmd.String("config"))
					if err != nil {
						return err
					}
					// output, err := filepath.Abs(cmd.String("output"))
					// if err != nil {
					// 	return err
					// }
					ParseConfig(config).Upload(cmd, filepath.Dir(config))
					return nil
				},
			},
			{
				Name:    "template",
				Aliases: []string{"t"},
				Usage:   "options for task templates",
				Commands: []*cli.Command{
					{
						Name:  "add",
						Usage: "add a new template",
						Action: func(ctx context.Context, cmd *cli.Command) error {
							fmt.Println("new task template: ", cmd.Args().First())
							return nil
						},
					},
					{
						Name:  "remove",
						Usage: "remove an existing template",
						Action: func(ctx context.Context, cmd *cli.Command) error {
							fmt.Println("removed task template: ", cmd.Args().First())
							return nil
						},
					},
				},
			},
		},
	}

	if err := cmd.Run(context.Background(), os.Args); err != nil {
		log.Fatal(err)
	}
}
