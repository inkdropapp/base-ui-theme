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
          "command": ["npm", "run", "build"]
      }
  ]' | watchman -j
