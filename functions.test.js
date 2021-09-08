const {filterVersions, filterVersionsByName} = require('./functions');

test('filterVersions returns undefined when undefined json given', async () => {
  expect(filterVersions(undefined, "5", "5", "5", "container")).toBe(undefined);
});

test('filterVersions returns empty list when empty tags given', async () => {
  let json = [
    {
      "metadata": {
        "container": {
          "tags": []
        }
      }
    }
  ];

  expect(filterVersions(json, "5", "5", "5", "container")).toStrictEqual([]);
});

test('filterVersions returns empty list when there are less versions than to keep', async () => {
  let json = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "container": {
          "tags": ["1.0.2-rc-blub"]
        }
      }
    },
    {
      "id": "2",
      "updated_at": "2019-01-21T06:36:30.188",
      "metadata": {
        "container": {
          "tags": ["1.0.1-rc-blub"]
        }
      }
    },
    {
      "id": "3",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "container": {
          "tags": ["1.0.2-snapshot"]
        }
      }
    },
    {
      "id": "4",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "container": {
          "tags": ["1.0.1-snapshot"]
        }
      }
    },
    {
      "id": "5",
      "updated_at": "2019-01-21T06:36:30.188",
      "metadata": {
        "container": {
          "tags": ["1.0.2-snapshot-blub"]
        }
      }
    },
    {
      "id": "6",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "container": {
          "tags": ["1.0.1-snapshot-blub"]
        }
      }
    }
  ];

  expect(filterVersions(json, "2", "2", "2", "container")).toStrictEqual([]);
});

test('filterVersions returns list when there are more versions than to keep', async () => {
  let json = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "container": {
          "tags": ["1.0.2-rc-blub"]
        }
      }
    },
    {
      "id": "2",
      "updated_at": "2019-01-21T06:36:30.188",
      "metadata": {
        "container": {
          "tags": ["1.0.1-rc-blub"]
        }
      }
    },
    {
      "id": "3",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "container": {
          "tags": ["1.0.2-snapshot"]
        }
      }
    },
    {
      "id": "4",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "container": {
          "tags": ["1.0.1-snapshot"]
        }
      }
    },
    {
      "id": "5",
      "updated_at": "2019-01-21T06:36:30.188",
      "metadata": {
        "container": {
          "tags": ["1.0.2-snapshot-blub"]
        }
      }
    },
    {
      "id": "6",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "container": {
          "tags": ["1.0.1-snapshot-blub"]
        }
      }
    }
  ];

  let expected = [
    {
      "id": "2",
      "updated_at": "2019-01-21T06:36:30.188",
      "version": "1.0.1-rc-blub"
    },
    {
      "id": "4",
      "updated_at": "2019-01-22T06:36:30.188",
      "version": "1.0.1-snapshot"
    },
    {
      "id": "5",
      "updated_at": "2019-01-21T06:36:30.188",
      "version": "1.0.2-snapshot-blub"
    }
  ]

  expect(filterVersions(json, "1", "1", "1", "container")).toStrictEqual(expected);
});

test('filterVersions returns list when there are more versions than to keep when package type is docker', async () => {
  let json = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "docker": {
          "tags": ["1.0.2-rc-blub"]
        }
      }
    },
    {
      "id": "2",
      "updated_at": "2019-01-21T06:36:30.188",
      "metadata": {
        "docker": {
          "tags": ["1.0.1-rc-blub"]
        }
      }
    },
    {
      "id": "3",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "docker": {
          "tags": ["1.0.2-snapshot"]
        }
      }
    },
    {
      "id": "4",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "docker": {
          "tags": ["1.0.1-snapshot"]
        }
      }
    },
    {
      "id": "5",
      "updated_at": "2019-01-21T06:36:30.188",
      "metadata": {
        "docker": {
          "tags": ["1.0.2-snapshot-blub"]
        }
      }
    },
    {
      "id": "6",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "docker": {
          "tags": ["1.0.1-snapshot-blub"]
        }
      }
    }
  ];

  let expected = [
    {
      "id": "2",
      "updated_at": "2019-01-21T06:36:30.188",
      "version": "1.0.1-rc-blub"
    },
    {
      "id": "4",
      "updated_at": "2019-01-22T06:36:30.188",
      "version": "1.0.1-snapshot"
    },
    {
      "id": "5",
      "updated_at": "2019-01-21T06:36:30.188",
      "version": "1.0.2-snapshot-blub"
    }
  ]

  expect(filterVersions(json, "1", "1", "1", "docker")).toStrictEqual(expected);
});

test('filterVersions returns list when there are more versions than to keep and package type is maven', async () => {
  let json = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "name": "1.0.2-rc-blub"
    },
    {
      "id": "2",
      "updated_at": "2019-01-21T06:36:30.188",
      "name": "1.0.1-rc-blub"
    },
    {
      "id": "3",
      "updated_at": "2019-01-22T06:36:30.188",
      "name": "1.0.2-snapshot"
    },
    {
      "id": "4",
      "updated_at": "2019-01-22T06:36:30.188",
      "name": "1.0.1-snapshot"
    },
    {
      "id": "5",
      "updated_at": "2019-01-21T06:36:30.188",
      "name": "1.0.2-snapshot-blub"
    },
    {
      "id": "6",
      "updated_at": "2019-01-22T06:36:30.188",
      "name": "1.0.1-snapshot-blub"
    }
  ];

  let expected = [
    {
      "id": "2",
      "updated_at": "2019-01-21T06:36:30.188",
      "version": "1.0.1-rc-blub"
    },
    {
      "id": "4",
      "updated_at": "2019-01-22T06:36:30.188",
      "version": "1.0.1-snapshot"
    },
    {
      "id": "5",
      "updated_at": "2019-01-21T06:36:30.188",
      "version": "1.0.2-snapshot-blub"
    }
  ]

  expect(filterVersions(json, "1", "1", "1", "maven")).toStrictEqual(expected);
});

test('filterVersionsByName returns undefined when undefined json given', async () => {
  expect(filterVersionsByName(undefined, "1.0.0-release")).toBe(undefined);
});

test('filterVersionsByName returns undefined when empty versions given', async () => {
  let json = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "name": "1.0.2-rc-blub"
    }
  ];

  expect(filterVersionsByName(json, "", "maven", "maven")).toBe(undefined);
});

test('filterVersionsByName returns empty list when names not matching - maven', async () => {
  let json = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "name": "1.0.2-rc-blub"
    }
  ];

  expect(filterVersionsByName(json, "1.0.0-release", "maven")).toStrictEqual([]);
});

test('filterVersionsByName returns empty list when names not matching - container', async () => {
  let json = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "container": {
          "tags": ["1.0.2-rc-blub"]
        }
      }
    }
  ];

  expect(filterVersionsByName(json, "1.0.0-release", "container")).toStrictEqual([]);
});

test('filterVersionsByName returns list when names match - maven', async () => {
  let json = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "name": "1.0.2-rc-blub"
    }
  ];

  let expected = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "version": "1.0.2-rc-blub"
    }
  ]

  expect(filterVersionsByName(json, "1.0.2-rc-blub", "maven")).toStrictEqual(expected);
});

test('filterVersionsByName returns list when names match - container', async () => {
  let json = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "container": {
          "tags": ["1.0.2-rc-blub"]
        }
      }
    }
  ];

  let expected = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "version": "1.0.2-rc-blub"
    }
  ]

  expect(filterVersionsByName(json, "1.0.2-rc-blub", "container")).toStrictEqual(expected);
});

test('filterVersionsByName returns list when names match - docker', async () => {
  let json = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "metadata": {
        "docker": {
          "tags": ["1.0.2-rc-blub"]
        }
      }
    }
  ];

  let expected = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "version": "1.0.2-rc-blub"
    }
  ]

  expect(filterVersionsByName(json, "1.0.2-rc-blub", "docker")).toStrictEqual(expected);
});

test('filterVersionsByName returns list when one match by multiples given - maven', async () => {
  let json = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "name": "1.0.2-rc-blub"
    }
  ];

  let expected = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "version": "1.0.2-rc-blub"
    }
  ]

  expect(filterVersionsByName(json, "1.0.2-rc-blub, 1.0.0-release", "maven")).toStrictEqual(expected);
});

test('filterVersionsByName returns list when multiple match by multiples given - maven', async () => {
  let json = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "name": "1.0.2-rc-blub"
    },
    {
      "id": "2",
      "updated_at": "2019-01-22T06:36:30.188",
      "name": "1.0.0-release"
    }
  ];

  let expected = [
    {
      "id": "1",
      "updated_at": "2019-01-22T06:36:30.188",
      "version": "1.0.2-rc-blub"
    },
    {
      "id": "2",
      "updated_at": "2019-01-22T06:36:30.188",
      "version": "1.0.0-release"
    }
  ]

  expect(filterVersionsByName(json, "1.0.2-rc-blub, 1.0.0-release", "maven")).toStrictEqual(expected);
});
