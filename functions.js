function filterVersions(json, numberOfRcToKeep, numberOfSnapshotsToKeep, numberOfFeatureSnapshotsToKeep, packageType) {
  if (json === undefined) {
    return undefined;
  }

  let mappedData;
  if (packageType === "maven") {
    mappedData = json.map(e => mapMavenVersionData(e));
  } else {
    mappedData = json
        .filter(e => e.metadata.container.tags.length > 0)
        .map(e => mapContainerVersionData(e));
  }

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

function mapMavenVersionData(e) {
  let data = {};
  data.id = e.id;
  data.version = e.name;
  data.updated_at = e.updated_at;

  return data;
}

function mapContainerVersionData(e) {
  let data = {};
  data.id = e.id;
  data.version = e.metadata.container.tags[0];
  data.updated_at = e.updated_at;

  return data;
}

function filterVersionsByName(json, versionNames, packageType) {
  if (json === undefined) {
    return undefined;
  }

  let versionsSplit = versionNames.split(',').map(e => e.trim());
  if (versionsSplit.length < 1 || (versionsSplit.length === 1 && versionsSplit[0] === "")) {
    return undefined;
  }

  if (packageType === "maven") {
    return filterMavenVersionsByName(json, versionsSplit);
  } else {
    return filterContainerVersionsByName(json, versionsSplit);
  }
}

function filterMavenVersionsByName(json, versions) {
  return json
      .filter(e => versions.includes(e.name))
      .map(e => {
        return mapMavenVersionData(e);
      });
}

function filterContainerVersionsByName(json, versions) {
  return json
      .filter(e => e.metadata.container.tags.length > 0)
      .filter(e => versions.includes(e.metadata.container.tags[0]))
      .map(e => mapContainerVersionData(e));
}

function deleteVersions(versions, owner, packageName, token, packageType) {
  if (versions === undefined || versions.length === 0) {
    console.log("Nothing to delete");

    return "";
  }

  versions.forEach(version => deleteVersion(version, owner, packageName, token, packageType));

  return versions.map(version => version.version).join();
}

function deleteVersion(version, owner, packageName, token, packageType) {
  console.log("Deleting version " + version.version);

  fetch('https://api.github.com/orgs/' + owner + '/packages/' + packageType + '/' + encodeURIComponent(packageName) + '/versions/' + version.id + '?package_type=' + packageType + '&visibility=internal', {
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

module.exports = {filterVersions, deleteVersions, filterVersionsByName};
