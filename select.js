const core = require('@actions/core');
const {filterVersions, deleteVersions} = require('functions');
require('isomorphic-fetch');

const main = async () => {
  const owner = core.getInput('owner');
  const packageName = core.getInput('package').toLowerCase();
  const token = core.getInput('github-token');
  const numberOfRcToKeep = core.getInput('number-of-release-candidates-to-keep');
  const numberOfSnapshotsToKeep = core.getInput('number-of-snapshots-to-keep');
  const numberOfFeatureSnapshotsToKeep = core.getInput('number-of-feature-snapshots-to-keep');

  fetch('https://api.github.com/orgs/' + owner + '/packages/container/' + encodeURIComponent(packageName) + '/versions?package_type=container&visibility=internal', {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'authorization': `token ${token}`,
    }
  })
      .then(res => {
        if (res.status === 200) {
          console.log("[" + res.status + "] Successfully loaded packages");
          return res.json();
        } else {
          throw new Error("[" + res.status + "] Something went wrong");
        }
      })
      .then(resJson => filterVersions(resJson, numberOfRcToKeep, numberOfSnapshotsToKeep, numberOfFeatureSnapshotsToKeep))
      .then(versions => deleteVersions(versions, owner, packageName, token))
      .then(versionIds => core.setOutput("versionIds", versionIds))
      .catch(error => {
        console.error(error);
        core.setFailed(error.message);
      });
}

main().catch(error => {
  core.setFailed(error.message);
});
