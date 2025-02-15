const core = require('@actions/core');
const {filterVersions, deleteVersions, filterVersionsByName} = require('./functions');
require('isomorphic-fetch');

const main = async () => {
  const owner = core.getInput('owner');
  const packageName = core.getInput('package').toLowerCase();
  const token = core.getInput('github-token');
  const numberOfRcToKeep = core.getInput('number-of-release-candidates-to-keep');
  const numberOfSnapshotsToKeep = core.getInput('number-of-snapshots-to-keep');
  const numberOfFeatureSnapshotsToKeep = core.getInput('number-of-feature-snapshots-to-keep');
  const packageType = core.getInput('package-type');
  const versionNames = core.getInput('version-names');

  if (versionNames === undefined || versionNames === "") {
    if (numberOfRcToKeep === undefined || numberOfRcToKeep === "" || numberOfSnapshotsToKeep === undefined || numberOfSnapshotsToKeep === "" || numberOfFeatureSnapshotsToKeep === undefined || numberOfFeatureSnapshotsToKeep === "") {
      core.setFailed("versionNames is not given. Therefore number-of-release-candidates-to-keep, number-of-snapshots-to-keep, number-of-feature-snapshots-to-keep must be set");
      return;
    }
  }

  const packageUrl = 'https://api.github.com/orgs/' + owner + '/packages/' + packageType + '/' + encodeURIComponent(packageName) + '/versions?package_type=' + packageType + '&visibility=internal&per_page=100';
  const getWithAuthorization = {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'authorization': `token ${token}`,
    }
  };

  const packageRequests = [];
  for (const page of ([1, 2])) {
    packageRequests.push(
        fetch(packageUrl + '&page=' + page, getWithAuthorization)
            .then(response => {
              if (response.status === 200) {
                console.log("[" + response.status + "] Successfully loaded packages");
                return response.json();
              } else {
                throw new Error("[" + response.status + "] Something went wrong");
              }
            }));
  }

  Promise.all(packageRequests)
      .then(data => data.flat())
      .then(resJson => {
        if (versionNames !== undefined && versionNames !== "") {
          return filterVersionsByName(resJson, versionNames, packageType);
        } else {
          return filterVersions(resJson, numberOfRcToKeep, numberOfSnapshotsToKeep, numberOfFeatureSnapshotsToKeep, packageType);
        }
      })
      .then(versions => deleteVersions(versions, owner, packageName, token, packageType))
      .then(versionIds => core.setOutput("versionIds", versionIds))
      .catch(error => {
        console.error(error);
        core.setFailed(error.message);
      });

}

main().catch(error => {
  core.setFailed(error.message);
});
