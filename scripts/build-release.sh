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
# Configuration
# ################################

chosen="apply-version.tmp"
root="rekord"
prefix="rekord*"
repos="https://api.github.com/repos/Rekord"

# ################################
# Functions
# ################################

# iterate_projects( question, function ) // for each chosen project, invokes function ${dir}
function iterate_projects() {
  question="$1"
  function="$2"
  REPLY="Y"
  if [ -n "${question}" ]; then
    read -p "${question}? (y/n): " -n 1 -r
    echo
  fi
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "${base}"
    for dir in ${prefix} ; do
      cd "${dir}"
      if [ -f "${chosen}" ]; then
        eval ${function} "${dir}"
      fi
      cd "${base}"
    done
  fi
}

# iterate_project_file( question, function, filename ) // for each chosen project that has the given file, invoke function ${file} ${dir}
function iterate_project_file() {
  question="$1"
  function="$2"
  filename="$3"
  REPLY="Y"
  if [ -n "${question}" ]; then
    read -p "${question}? (y/n): " -n 1 -r
    echo
  fi
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$base"
    for dir in ${base}/${prefix} ; do
      if [ -f "${dir}/${chosen}" ]; then
        instance="${dir}/${filename}"
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
  search="(\"version\":[[:space:]]*\").+(\")"
  replace="\1${version}\2"
  sed -i ".tmp" -E "s/${search}/${replace}/g" "${file}"
  rm "${file}.tmp"
}

# update_dependency( file ) // Update project property in dependencies in JSON file
function update_dependency() {
  file="$1"
  search="(\"${root}\":[[:space:]]*\").+(\")"
  replace="\1~${version}\2"
  sed -i ".tmp" -E "s/${search}/${replace}/g" "${file}"
  rm "${file}.tmp"
}

# run_build( project ) // Run the build process for the current project
function run_build() {
  project="$1"
  if [ -f "Gulpfile.js" ]; then
    if ! gulp ; then
      echo "The build process for ${project} failed!"
      exit 1
    fi
  fi
}

# commit_build( project ) // Commit the changed files locally and remotely
function commit_build() {
  git add -A
  git commit -m "Build for ${version}"
  git push
}

# add_release( project ) // Adds
function add_release() {
  project="$1"
  if [ -z "${access_token}" ]; then
    echo "Access token is required for adding releases"
    exit 1
  fi
  API_JSON=$(printf '{"tag_name": "%s","target_commitish": "master","name": "Release %s","body": "Automatic release with Rekord %s","draft": false,"prerelease": false}' ${version} ${version} ${version})
  curl --data "$API_JSON" ${repos}/${project}/releases?access_token=${access_token}
}

# publish_node( project ) // Publish to NPM
function publish_node() {
  npm publish
}

# choose_projects() // Allow user to choose which projects we're going to work with
function choose_projects() {
  for dir in ${prefix}; do
    read -p "${dir}? (y/n): " -n 1 -r
    echo
    file="${dir}/${chosen}"
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      touch "${file}"
    else
      if [ -f "${file}" ]; then
        rm "${file}"
      fi
    fi
  done
}

# ignore_chose( file ) // Add chosen markers to gitignore
function ignore_chosen() {
  file="$1"
  grep -qF "${chosen}" "${file}" || echo -e "\n${chosen}" >> "${file}"
}

# remove_file( file ) // Removes file
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

iterate_project_file "Update dependency (bower)" update_dependency "bower.json"

iterate_project_file "Update dependency (npm)" update_dependency "package.json"

iterate_projects "Run builds" run_build

iterate_projects "Commit builds" commit_build

iterate_projects "Create releases" add_release

iterate_projects "Publish to NPM" publish_node

iterate_project_file "" remove_file "${chosen}"
