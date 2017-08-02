echo "Arguments: version [base directory] [access token]"

# ################################
# Arguments
# ################################

version="$1"
relative="$2"
access_token="$3"

# Require Version Argument
if [ -z "${version}" ]
then
  echo "A version argument is required"
  exit 1
fi

# Optional Base Directory
base="$(pwd)"
if [ -n "${relative}" ]
then
  base="${base}/${relative}"
  cd "${base}"
  base="$(pwd)"
fi

# ################################
# Variables
# ################################

search='("version":[[:space:]]*").+(")'
rekord='("rekord":[[:space:]]*).+("")'
replace="\1${version}\2"
approx="\1~${version}\2"
chosen="rekord-apply-version"

# ################################
# Functions
# ################################

# iterate_projects( question, function ) // for each chosen project, invokes function ${dir}
function iterate_projects() {
  question="$1"
  function="$2"
  read -p "${question}? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$base"
    for dir in rekord*; do
      if [ -f "${dir}/${chosen}" ]; then
        cd "${base}/${dir}"
        eval ${function} "${dir}"
      fi
    done
  fi
}

# iterate_project_file( question, function, file ) // for each chosen project that has the given file, invoke function ${file} ${dir}
function iterate_project_file() {
  question="$1"
  function="$2"
  file="$3"
  REPLY="Y"
  if [ -n "${question}" ]; then
    read -p "${question}? (y/n): " -n 1 -r
    echo
  fi
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$base"
    for dir in rekord*; do
      if [ -f "${dir}/${chosen}" ]; then
        instance="${dir}/${file}"
        if [ -f "${instance}" ]; then
          eval ${function} "${instance}" "${dir}"
        fi
      fi
    done
  fi
}

# update_version ( file ) // Update version property in JSON file
function update_version() {
  file="$1"
  sed -i ".tmp" -E "s/${search}/${replace}/g" "${file}"
  rm "${file}.tmp"
}

# update_dependency( file ) // Update rekord property in dependencies in JSON file
function update_dependency() {
  file="$1"
  sed -i ".tmp" -E "s/${rekord}/${approx}/g" "${file}"
  rm "${file}.tmp"
}

# run_build() // Run the build process for the current project
function run_build() {
  gulp
}

# commit_build() // Commit the changed files locally and remotely
function commit_build() {
  git add -A
  git commit -m "Build for ${version}"
  git push
}

# add_release( project ) // Adds
function add_release() {
  dir="$1"
  if [ -z "${access_token}" ]; then
    echo "Access token is required for adding releases"
    exit 1
  fi
  API_JSON=$(printf '{"tag_name": "%s","target_commitish": "master","name": "%s","body": "Release of version %s","draft": false,"prerelease": false}' ${version} ${version} ${version})
  curl --data "$API_JSON" https://api.github.com/repos/Rekord/${dir}/releases?access_token=${access_token}
}

# publish_node() // Publish to NPM
function publish_node() {
  npm publish
}

# choose_projects() // Allow user to choose which projects we're going to work with
function choose_projects() {
  for dir in rekord*; do
    read -p "${dir}? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      touch "${dir}/${chosen}"
    fi
  done
}

# ignore_chose() // Add chosen markers to gitignore
function ignore_chosen() {
  file="$1"
  grep -qF "${chosen}" "${file}" || echo "${chosen}" >> "${file}"
}

# remove_file() // Removes file
function remove_file() {
  file="$1"
  rm "${file}"
}

# ################################
# Execute
# ################################

choose_projects

iterate_project_file "" ignore_chosen ".gitignore"

iterate_project_file "Update bower.json files" update_version "bower.json"

iterate_project_file "Update package.json files" update_version "package.json"

iterate_project_file "Update rekord dependency (bower)" update_dependency "bower.json"

iterate_project_file "Update rekord dependency (npm)" update_dependency "package.json"

iterate_projects "Run builds" run_build

iterate_projects "Commit builds" commit_build

iterate_projects "Create releases" add_release

iterate_projects "Publish to NPM" publish_node

iterate_project_file "" remove_file "rekord-apply-version"
