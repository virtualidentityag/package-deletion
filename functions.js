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
      .filter(e => e.version.match(regex) !== null)
      .sort((a, b) => sortByDateDescending(a, b))
      .slice(numberToKeep, this.length);
}

function sortByDateDescending(a, b) {
  return new Date(b.updated_at) - new Date(a.updated_at);
}

function deleteVersions(versions, owner, packageName, token) {
  if (versions === undefined || versions.length === 0) {
    console.log("Nothing to delete");

    return "";
  }

  versions.forEach(version => deleteVersion(version, owner, packageName, token));

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
      console.error("[" + res.status + "] Something went wrong for version " + version.version)
    }
  });
}

module.exports = {filterVersions, deleteVersions};
