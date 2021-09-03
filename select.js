const core = require('@actions/core');
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
          throw "[" + res.status + "] Something went wrong";
        }
      })
      .then(resJson => filterVersions(resJson, numberOfRcToKeep, numberOfSnapshotsToKeep, numberOfFeatureSnapshotsToKeep))
      .then(versions => deleteVersions(versions, owner, packageName, token))
      .then(versionIds => core.setOutput("versionIds", versionIds))
      .catch(error => {
        console.error(error);
        throw error;
      });
}

function filterVersions(json, numberOfRcToKeep, numberOfSnapshotsToKeep, numberOfFeatureSnapshotsToKeep) {
  if (json === undefined) {
    return undefined;
  }

  let mappedData = json.filter(e => {
    return e.metadata.container.tags.length > 0;
  }).map(e => {
    let data = {};
    data.id = e.id;
    data.version = e.metadata.container.tags[0];
    data.updated_at = e.updated_at;
    return data;
  });

  // Filter out release candidates
  let releaseCandidatesToDelete = filterSortAndSlice(mappedData, /^[0-9]+\.[0-9]+\.[0-9]+-rc.*$/gi, numberOfRcToKeep);

  // Filter out snapshots
  let snapshotsToDelete = filterSortAndSlice(mappedData, /^[0-9]+\.[0-9]+\.[0-9]+-snapshot$/gi, numberOfSnapshotsToKeep);

  // Filter out feature branches
  let featureBranchesToDelete = filterSortAndSlice(mappedData, /^[0-9]+\.[0-9]+\.[0-9]+-snapshot-.*$/gi, numberOfFeatureSnapshotsToKeep);

  return releaseCandidatesToDelete.concat(snapshotsToDelete, featureBranchesToDelete);
}

function filterSortAndSlice(mappedData, regex, numberToKeep) {
  return mappedData
      .filter(e => regex.test(e.version))
      .sort((a, b) => sortByDateDescending(a, b))
      .slice(numberToKeep, this.length);
}

function sortByDateDescending(a, b) {
  return new Date(b.updated_at) - new Date(a.updated_at);
}

function deleteVersions(versions) {
  if (versions === undefined || versions.length === 0) {
    console.log("Nothing to delete");

    return "";
  }

  versions.forEach(version => deleteVersion(version));

  return versions.map(version => version.version).join();
}

function deleteVersion(version, owner, packageName, token) {
  console.log("Deleting version " + version.version);

  fetch('https://api.github.com/orgs/' + owner + '/packages/container/' + encodeURIComponent(packageName) + '/versions/' + version.id + '?package_type=container&visibility=internal', {
    method: 'DELETE',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'authorization': `token ${token}`,
    }
  }).then(res => {
    if (res.status === 204) {
      console.log("[" + res.status + "] Successfully deleted version " + version.version);
    } else {
      console.log("[" + res.status + "] Something went wrong for version " + version.version)
    }
  });
}

main().catch(error => {
  console.log("i am here");
  core.setFailed(error.message);
});
