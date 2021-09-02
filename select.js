const core = require('@actions/core');
require('isomorphic-fetch');

try {
  const owner = core.getInput('owner');
  const packageName = core.getInput('package').toLowerCase();
  const token = core.getInput('github-token');
  const numberOfRcToKeep = core.getInput('number-of-release-candidates-to-keep');
  const numberOfSnapshotsToKeep = core.getInput('number-of-snapshots-to-keep');
  const numberOfFeatureSnapshotsToKeep = core.getInput('number-of-feature-snapshots-to-keep');

  function filterVersionsNew(json) {
    console.log(json);

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

    let allVersions = releaseCandidatesToDelete.concat(snapshotsToDelete, featureBranchesToDelete);

    return allVersions.join();
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

  fetch('https://api.github.com/orgs/' + owner + '/packages/container/' + encodeURIComponent(packageName) + '/versions?package_type=container&visibility=internal', {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'authorization': `token ${token}`,
    }
  })
      .then(res => res.json())
      .then(resJson => filterVersionsNew(resJson))
      .then(versionIds => core.setOutput("versionIds", versionIds));

} catch (error) {
  core.setFailed(error.message);
}
