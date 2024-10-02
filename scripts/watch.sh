#/bin/env fish

watchman watch ./src

echo '[
      "trigger", "./src", {
          "name": "buildme",
          "expression": [
              "anyof",
              [
                "match",
                "**/*.*",
                "wholename"
              ]
          ],
          "chdir": "..",
          "command": ["bun", "run", "build"]
      }
  ]' | watchman -j
