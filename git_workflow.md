# workflow

GitHub Actions uses YAML syntax to define the workflow. Each workflow is stored as a separate YAML file in your code repository, in a directory named .github/workflows.


## basic

> One or more events that will trigger the workflow.
> One or more jobs, each of which will execute on a runner machine and run a series of one or more steps.
> Each step can either run a script that you define or run an action, which is a reusable extension that can simplify your workflow.

``` yml
name: learn-github-actions
run-name: ${{ github.actor }} is learning GitHub Actions
on: [push]
jobs:
  check-bats-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '14'
      - run: npm install -g bats
      - run: bats -v
```

## 变量

This value can include expressions and can reference the github and inputs contexts.
``` yml
run-name: Deploy to ${{ inputs.deploy_target }} by @${{ github.actor }}
```

## 触发器 on

To automatically trigger a workflow, use on to define which events can cause the workflow to run. For a list of available events, see "Events that trigger workflows."

[所有触发事件](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)

### 单一事件

``` yml
on: push
```
### 多个事件
``` yml
on: [push, fork]
```
### 事件子类型

``` yml
on:
  issues:
    types:
      - opened
      - labeled
```
### 事件过滤器
``` yml
on:
  push:
    branches:
      - main
      - 'releases/**'
```
#### 排除过滤器
``` yml
on:
  pull_request:
    # Sequence of patterns matched against refs/heads
    branches-ignore:    
      - 'mona/octocat'
      - 'releases/**-alpha'
```
``` yml
on:
  push:
    # Sequence of patterns matched against refs/heads
    branches-ignore:    
      - 'mona/octocat'
      - 'releases/**-alpha'
    # Sequence of patterns matched against refs/tags
    tags-ignore:        
      - v2
      - v1.*
```

Example: Including branches and tags

The patterns defined in branches and tags are evaluated against the Git ref's name. For example, the following workflow would run whenever there is a push event to:

A branch named main (refs/heads/main)
A branch named mona/octocat (refs/heads/mona/octocat)
A branch whose name starts with releases/, like releases/10 (refs/heads/releases/10)
A tag named v2 (refs/tags/v2)
A tag whose name starts with v1., like v1.9.1 (refs/tags/v1.9.1)

``` yml
on:
  push:
    # Sequence of patterns matched against refs/heads
    branches:    
      - main
      - 'mona/octocat'
      - 'releases/**'
    # Sequence of patterns matched against refs/tags
    tags:        
      - v2
      - v1.*
```

### 基于提交修改涉及路径
``` yml
on:
  push:
    paths:
      - '**.js'
```

### 定时触发
#### POSIX cron syntax
(POSIX cron syntax)[https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html#tag_20_25_07]

``` yml
on:
  schedule:
    # * is a special character in YAML so you have to quote this string
    - cron:  '30 5,17 * * *'
```

### 调用触发 on.workflow_call

When using the workflow_call keyword, you can optionally specify inputs that are passed to the called workflow from the caller workflow. For more information about the workflow_call keyword, see "Events that trigger workflows."

``` yml
on:
  workflow_call:
    inputs:
      username:
        description: 'A username passed from the caller workflow'
        default: 'john-doe'
        required: false
        type: string

jobs:
  print-username:
    runs-on: ubuntu-latest

    steps:
      - name: Print the input name to STDOUT
        run: echo The username is ${{ inputs.username }}
```
``` yml
on:
  workflow_call:
    # Map the workflow outputs to job outputs
    outputs:
      workflow_output1:
        description: "The first job output"
        value: ${{ jobs.my_job.outputs.job_output1 }}
      workflow_output2:
        description: "The second job output"
        value: ${{ jobs.my_job.outputs.job_output2 }}
```

###  wrokflow_run 触发

For example, a workflow with the following trigger will only run when the workflow named Build runs on a branch whose name starts with releases/:
 ``` yml
on:
  workflow_run:
    workflows: ["Build"]
    types: [requested]
    branches:
      - 'releases/**'
 ```

 ## 权限 permissions
You can use permissions to modify the default permissions granted to the GITHUB_TOKEN, adding or removing access as required, so that you only allow the minimum required access. For more information, see "Automatic token authentication."

You can use permissions either as a top-level key, to apply to all jobs in the workflow, or within specific jobs. When you add the permissions key within a specific job, all actions and run commands within that job that use the GITHUB_TOKEN gain the access rights you specify. For more information, see jobs.<job_id>.permissions.


 ``` yml
permissions:
  actions: read|write|none
  checks: read|write|none
  contents: read|write|none
  deployments: read|write|none
  id-token: read|write|none
  issues: read|write|none
  discussions: read|write|none
  packages: read|write|none
  pages: read|write|none
  pull-requests: read|write|none
  repository-projects: read|write|none
  security-events: read|write|none
  statuses: read|write|none
 ```

 ## 环境变量 env
 A map of variables that are available to the steps of all jobs in the workflow. You can also set variables that are only available to the steps of a single job or to a single step. For more information, see jobs.<job_id>.env and jobs.<job_id>.steps[*].env.

 ``` yml
env:
  SERVER: production
 ```

 ## 默认设置 defaults
``` yml
defaults:
  run:
    shell: bash
    working-directory: scripts
```

## 任务依赖 job.build.needs

``` yml
obs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - run: ./setup_server.sh
  build:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - run: ./build_server.sh
  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: ./test_server.sh
```

## 任务循环 job.build.strategy.matrix

A matrix strategy lets you use variables in a single job definition to automatically create multiple job runs that are based on the combinations of the variables. For example, you can use a matrix strategy to test your code in multiple versions of a language or on multiple operating systems. The matrix is created using the strategy keyword, which receives the build options as an array. For example, this matrix will run the job multiple times, using different versions of Node.js:

``` yml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [12, 14, 16]
    steps:
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node }}

```
##  任务缓存

``` yml
jobs:
  example-job:
    steps:
      - name: Cache node modules
        uses: actions/cache@v3
        env:
          cache-name: cache-node-modules
        with:
          path: ~/.npm
          key: ${{ runner.os }}-build-${{ env.cache-name }}-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-build-${{ env.cache-name }}-
```
## 使用容器 
``` yml
jobs:
  container-job:
    runs-on: ubuntu-latest
    container: node:10.18-jessie
    services:
      postgres:
        image: postgres
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Connect to PostgreSQL
        run: node client.js
        env:
          POSTGRES_HOST: postgres
          POSTGRES_PORT: 5432
```

## 并发控制 concurrency

By default, the jobs in your workflow all run in parallel at the same time.

When a concurrent job or workflow is queued, if another job or workflow using the same concurrency group in the repository is in progress, the queued job or workflow will be pending. Any previously pending job or workflow in the concurrency group will be canceled. To also cancel any currently running job or workflow in the same concurrency group, specify cancel-in-progress: true.

``` yml
concurrency:
  group: ${{ github.ref }}
  cancel-in-progress: true

```

When a concurrent job or workflow is queued, if another job or workflow using the same concurrency group in the repository is in progress, the queued job or workflow will be pending. Any previously pending job or workflow in the concurrency group will be canceled. To also cancel any currently running job or workflow in the same concurrency group, specify cancel-in-progress: true.

## secrets

If your workflows use sensitive data, such as passwords or certificates, you can save these in GitHub as secrets and then use them in your workflows as environment variables. This means that you will be able to create and share workflows without having to embed sensitive values directly in the workflow's YAML source.

```yml
jobs:
  example-job:
    runs-on: ubuntu-latest
    steps:
      - name: Retrieve secret
        env:
          super_secret: ${{ secrets.SUPERSECRET }}
        run: |
          example-command "$super_secret"
```

## job
A workflow run is made up of one or more jobs, which run in parallel by default. To run jobs sequentially, you can define dependencies on other jobs using the jobs.<job_id>.needs keyword.

Each job runs in a runner environment specified by runs-on.

### jobs.<job_id>.steps

A job contains a sequence of tasks called steps. Steps can run commands, run setup tasks, or run an action in your repository, a public repository, or an action published in a Docker registry. Not all steps run actions, but all actions run as a step. Each step runs in its own process in the runner environment and has access to the workspace and filesystem. Because steps run in their own process, changes to environment variables are not preserved between steps. GitHub provides built-in steps to set up and complete a job.

#### Using an action inside a different private repository than the workflow

Your workflow must checkout the private repository and reference the action locally. Generate a personal access token and add the token as an encrypted secret. For more information, see "Creating a personal access token" and "Encrypted secrets."


``` yml
obs:
  my_first_job:
    steps:
      - name: Check out repository
        uses: actions/checkout@v3
        with:
          repository: octocat/my-private-repo
          ref: v1.0
          token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
          path: ./.github/actions/my-private-repo
      - name: Run my action
        uses: ./.github/actions/my-private-repo/my-action
```
### jobs.<job_id>.steps[*].with
A map of the input parameters defined by the action. Each input parameter is a key/value pair. Input parameters are set as environment variables. The variable is prefixed with INPUT_ and converted to upper case.

``` yml
jobs:
  my_first_job:
    steps:
      - name: My first step
        uses: actions/hello_world@main
        with:
          first_name: Mona
          middle_name: The
          last_name: Octocat
```
### jobs.<job_id>.steps[*].with.args
A string that defines the inputs for a Docker container. GitHub passes the args to the container's ENTRYPOINT when the container starts up. An array of strings is not supported by this parameter. A single argument that includes spaces should be surrounded by double quotes "".

``` yml
steps:
  - name: Explain why this job ran
    uses: octo-org/action-name@main
    with:
      entrypoint: /bin/echo
      args: The ${{ github.event_name }} event triggered this step.
```

### jobs.<job_id>.steps[*].env
Sets variables for steps to use in the runner environment. You can also set variables for the entire workflow or a job. For more information, see env and jobs.<job_id>.env.


### jobs.<job_id>.if

You can use the jobs.<job_id>.if conditional to prevent a job from running unless a condition is met. You can use any supported context and expression to create a conditional. For more information on which contexts are supported in this key, see "Contexts."

``` yml
name: example-workflow
on: [push]
jobs:
  production-deploy:
    if: github.repository == 'octo-org/octo-repo-prod'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '14'
      - run: npm install -g bats
```

### jobs.<job_id>.runs-on
define the type of machine to run the job on

> The destination machine can be either a GitHub-hosted runner, larger runner, or a self-hosted runner.
> You can target runners based on the labels assigned to them, or their group membership, or a combination of these.
> You can provide runs-on as a single string or as an array of strings.
> If you specify an array of strings, your workflow will execute on any runner that matches all of the specified runs-on values.
> If you would like to run your workflow on multiple machines, use jobs.<job_id>.strategy.

[可以使用的runnder](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idruns-on)

#### Choosing self-hosted runners

To specify a self-hosted runner for your job, configure runs-on in your workflow file with self-hosted runner labels.

All self-hosted runners have the self-hosted label. Using only this label will select any self-hosted runner. 

#### runner group
You can use runs-on to target runner groups, so that the job will execute on any runner that is a member of that group. For more granular control, you can also combine runner groups with labels.

``` yml
name: learn-github-actions
on: [push]
jobs:
  check-bats-version:
    runs-on: 
      group: ubuntu-runners
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '14'
      - run: npm install -g bats
      - run: bats -v
```

#### Combining groups and labels
When you combine groups and labels, the runner must meet both requirements to be eligible to run the job.

``` yml
name: learn-github-actions
on: [push]
jobs:
  check-bats-version:
    runs-on:
      group: ubuntu-runners
      labels: ubuntu-20.04-16core
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '14'
      - run: npm install -g bats
      - run: bats -v
```

### jobs.job_id.outputs

``` yml
jobs:
  job1:
    runs-on: ubuntu-latest
    # Map a step output to a job output
    outputs:
      output1: ${{ steps.step1.outputs.test }}
      output2: ${{ steps.step2.outputs.test }}
    steps:
      - id: step1
        run: echo "test=hello" >> "$GITHUB_OUTPUT"
      - id: step2
        run: echo "test=world" >> "$GITHUB_OUTPUT"
  job2:
    runs-on: ubuntu-latest
    needs: job1
    steps:
      - env:
          OUTPUT1: ${{needs.job1.outputs.output1}}
          OUTPUT2: ${{needs.job1.outputs.output2}}
        run: echo "$OUTPUT1 $OUTPUT2"
```

### jobs.<job_id>.defaults.run
 Use jobs.<job_id>.defaults.run to provide default shell and working-directory to all run steps in the job. Context and expression are not allowed in this section.

 ``` yml
jobs:
  job1:
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
        working-directory: scripts
 ```

### jobs.<job_id>.container
Use jobs.<job_id>.container to create a container to run any steps in a job that don't already specify a container. If you have steps that use both script and container actions, the container actions will run as sibling containers on the same network with the same volume mounts.

If you do not set a container, all steps will run directly on the host specified by runs-on unless a step refers to an action configured to run in a container.

``` yml
name: CI
on:
  push:
    branches: [ main ]
jobs:
  container-test-job:
    runs-on: ubuntu-latest
    container:
      image: node:14.16
      env:
        NODE_ENV: development
      ports:
        - 80
      volumes:
        - my_docker_volume:/volume_mount
      options: --cpus 1
    steps:
      - name: Check for dockerenv file
        run: (ls /.dockerenv && echo Found dockerenv) || (echo No dockerenv)
```

### jobs.<job_id>.services
Used to host service containers for a job in a workflow. Service containers are useful for creating databases or cache services like Redis. The runner automatically creates a Docker network and manages the life cycle of the service containers.

``` yml
services:
  nginx:
    image: nginx
    # Map port 8080 on the Docker host to port 80 on the nginx container
    ports:
      - 8080:80
  redis:
    image: redis
    # Map TCP port 6379 on Docker host to a random free port on the Redis container
    ports:
      - 6379/tcp
```

``` yml
services:
  myservice1:
    image: ghcr.io/owner/myservice1
    credentials:
      username: ${{ github.actor }}
      password: ${{ secrets.github_token }}
  myservice2:
    image: dockerhub_org/myservice2
    credentials:
      username: ${{ secrets.DOCKER_USER }}
      password: ${{ secrets.DOCKER_PASSWORD }}
```

### jobs.<job_id>.uses

The location and version of a reusable workflow file to run as a job. Use one of the following syntaxes:

> {owner}/{repo}/.github/workflows/{filename}@{ref} for reusable workflows in public and private repositories.
> ./.github/workflows/{filename} for reusable workflows in the same repository.


## Workflow commands

Actions can communicate with the runner machine to set environment variables, output values used by other actions, add debug messages to the output logs, and other tasks.

Most workflow commands use the echo command in a specific format, while others are invoked by writing to a file. For more information, see "Environment files."

``` shell
echo "::workflow-command parameter1={data},parameter2={data}::{command value}"
```

``` shell
     - name: Create annotation for build error
        run: echo "::error file=app.js,line=1::Missing semicolon"
```

``` yml
on: push

jobs:
  secret-generator:
    runs-on: ubuntu-latest
    steps:
    - uses: some/secret-store@v1
      with:
        credentials: ${{ secrets.SECRET_STORE_CREDENTIALS }}
        instance: ${{ secrets.SECRET_STORE_INSTANCE }}
    - name: generate secret
      shell: bash
      run: |
        GENERATED_SECRET=$((RANDOM))
        echo "::add-mask::$GENERATED_SECRET"
        SECRET_HANDLE=$(secret-store store-secret "$GENERATED_SECRET")
        echo "handle=$secret_handle" >> "$GITHUB_OUTPUT"
  secret-consumer:
    runs-on: macos-latest
    needs: secret-generator
    steps:
    - uses: some/secret-store@v1
      with:
        credentials: ${{ secrets.SECRET_STORE_CREDENTIALS }}
        instance: ${{ secrets.SECRET_STORE_INSTANCE }}
    - name: use secret
      shell: bash
      run: |
        SECRET_HANDLE="${{ needs.secret-generator.outputs.handle }}"
        RETRIEVED_SECRET=$(secret-store retrieve-secret "$SECRET_HANDLE")
        echo "::add-mask::$RETRIEVED_SECRET"
        echo "We retrieved our masked secret: $RETRIEVED_SECRET"
```

## Environment files
uring the execution of a workflow, the runner generates temporary files that can be used to perform certain actions. The path to these files are exposed via environment variables. You will need to use UTF-8 encoding when writing to these files to ensure proper processing of the commands. Multiple commands can be written to the same file, separated by newlines.

Most commands in the following examples use double quotes for echoing strings, which will attempt to interpolate characters like $ for shell variable names. To always use literal values in quoted strings, you can use single quotes instead.

### Setting an environment variable

``` yml
echo "{environment_variable_name}={value}" >> $GITHUB_ENV

```

``` yml
teps:
  - name: Set the value
    id: step_one
    run: |
      echo "action_state=yellow" >> $GITHUB_ENV
  - name: Use the value
    id: step_two
    run: |

      echo "${{ env.action_state }}" # This will output 'yellow'
```

### Setting an output parameter
``` yml
echo "{name}={value}" >> $GITHUB_OUTPUT

```

``` yml
      - name: Set color
        id: random-color-generator
        run: echo "SELECTED_COLOR=green" >> $GITHUB_OUTPUT
      - name: Get color

        run: echo "The selected color is ${{ steps.random-color-generator.outputs.SELECTED_COLOR }}"

```

## Reusing workflows

Rather than copying and pasting from one workflow to another, you can make workflows reusable. You and anyone with access to the reusable workflow can then call the reusable workflow from another workflow.

Reusing workflows avoids duplication. This makes workflows easier to maintain and allows you to create new workflows more quickly by building on the work of others, just as you do with actions. Workflow reuse also promotes best practice by helping you to use workflows that are well designed, have already been tested, and have been proven to be effective. Your organization can build up a library of reusable workflows that can be centrally maintained.

A reusable workflow can be used by another workflow if any of the following is true:

> Both workflows are in the same repository.
> The called workflow is stored in a public repository, and your organization allows you to use public reusable workflows.
> The called workflow is stored in a private repository and the settings for that repository allow it to be accessed. For more information, see "Sharing actions and workflows with your organization" and "Sharing actions and workflows from your private repository."
>
### Creating a reusable workflow

Reusable workflows are YAML-formatted files, very similar to any other workflow file. As with other workflow files, you locate reusable workflows in the .github/workflows directory of a repository. Subdirectories of the workflows directory are not supported.

For a workflow to be reusable, the values for on must include *workflow_call*:

### Calling a reusable workflow
1.
``` yml
jobs:
  call-workflow-passing-data:
    uses: octo-org/example-repo/.github/workflows/reusable-workflow.yml@main
    with:
      config-path: .github/labeler.yml
    secrets:
      envPAT: ${{ secrets.envPAT }}
```
2.
``` yml
name: Reusable workflow

on:
  workflow_call:
    # Map the workflow outputs to job outputs
    outputs:
      firstword:
        description: "The first output string"
        value: ${{ jobs.example_job.outputs.output1 }}
      secondword:
        description: "The second output string"
        value: ${{ jobs.example_job.outputs.output2 }}

jobs:
  example_job:
    name: Generate output
    runs-on: ubuntu-latest
    # Map the job outputs to step outputs
    outputs:
      output1: ${{ steps.step1.outputs.firstword }}
      output2: ${{ steps.step2.outputs.secondword }}
    steps:
      - id: step1
        run: echo "firstword=hello" >> $GITHUB_OUTPUT
      - id: step2
        run: echo "secondword=world" >> $GITHUB_OUTPUT
```

```yml
name: Call a reusable workflow and use its outputs

on:
  workflow_dispatch:

jobs:
  job1:
    uses: octo-org/example-repo/.github/workflows/called-workflow.yml@v1

  job2:
    runs-on: ubuntu-latest
    needs: job1
    steps:
      - run: echo ${{ needs.job1.outputs.firstword }} ${{ needs.job1.outputs.secondword }}
```

## cache dependencies

Workflow runs often reuse the same outputs or downloaded dependencies from one run to another. For example, package and dependency management tools such as Maven, Gradle, npm, and Yarn keep a local cache of downloaded dependencies.

Jobs on GitHub-hosted runners start in a clean runner image and must download dependencies each time, causing increased network utilization, longer runtime, and increased cost. To help speed up the time it takes to recreate files like dependencies, GitHub can cache files you frequently use in workflows.

To cache dependencies for a job, you can use GitHub's cache action. The action creates and restores a cache identified by a unique key. Alternatively, if you are caching the package managers listed below, using their respective setup-* actions requires minimal configuration and will create and restore dependency caches for you.

### Using the cache action

``` yml
name: Caching with npm
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Cache node modules
        id: cache-npm
        uses: actions/cache@v3
        env:
          cache-name: cache-node-modules
        with:
          # npm cache files are stored in `~/.npm` on Linux/macOS
          path: ~/.npm
          key: ${{ runner.os }}-build-${{ env.cache-name }}-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-build-${{ env.cache-name }}-
            ${{ runner.os }}-build-
            ${{ runner.os }}-

      - if: ${{ steps.cache-npm.outputs.cache-hit != 'true' }}
        name: List the state of node modules
        continue-on-error: true
        run: npm list

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Test
        run: npm test
```

## artifacts
Artifacts allow you to persist data after a job has completed, and share that data with another job in the same workflow. An artifact is a file or collection of files produced during a workflow run. For example, you can use artifacts to save your build and test output after a workflow run has ended. All actions and workflows called within a run have write access to that run's artifacts.

By default, GitHub stores build logs and artifacts for 90 days, and this retention period can be customized. For more information, see "Usage limits, billing, and administration." The retention period for a pull request restarts each time someone pushes a new commit to the pull request.

### artifacts vs dependency caching

> Use caching when you want to reuse files that don't change often between jobs or workflow runs, such as build dependencies from a package management system.
> Use artifacts when you want to save files produced by a job to view after a workflow run has ended, such as built binaries or build logs.


``` yml
name: Node CI

on: [push]

jobs:
  build_and_test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      - name: npm install, build, and test
        run: |
          npm install
          npm run build --if-present
          npm test
      - name: Archive production artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist-without-markdown
          path: |
            dist
            !dist/**/*.md
      - name: Archive code coverage results
        uses: actions/upload-artifact@v3
        with:
          name: code-coverage-report
          path: output/test/code-coverage.html
```

``` yml
name: Share data between jobs

on: [push]

jobs:
  job_1:
    name: Add 3 and 7
    runs-on: ubuntu-latest
    steps:
      - shell: bash
        run: |
          expr 3 + 7 > math-homework.txt
      - name: Upload math result for job 1
        uses: actions/upload-artifact@v3
        with:
          name: homework
          path: math-homework.txt

  job_2:
    name: Multiply by 9
    needs: job_1
    runs-on: windows-latest
    steps:
      - name: Download math result for job 1
        uses: actions/download-artifact@v3
        with:
          name: homework
      - shell: bash
        run: |
          value=`cat math-homework.txt`
          expr $value \* 9 > math-homework.txt
      - name: Upload math result for job 2
        uses: actions/upload-artifact@v3
        with:
          name: homework
          path: math-homework.txt

  job_3:
    name: Display results
    needs: job_2
    runs-on: macOS-latest
    steps:
      - name: Download math result for job 2
        uses: actions/download-artifact@v3
        with:
          name: homework
      - name: Print the final result
        shell: bash
        run: |
          value=`cat math-homework.txt`
          echo The result is $value
```

## Sharing workflows, secrets, and runners with your organization
### Sharing secrets and variables within an organization

> On GitHub.com, navigate to the main page of the organization.

>  Under your organization name, click  Settings. If you cannot see the "Settings" tab, select the  dropdown menu, then click Settings.