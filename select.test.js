const {filterVersions} = require('./functions');

test('filterVersions returns undefined when undefined json given', async () => {
  expect(filterVersions(undefined, "5", "5", "5")).toBe(undefined);
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

  expect(filterVersions(json, "5", "5", "5")).toStrictEqual([]);
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

  expect(filterVersions(json, "2", "2", "2")).toStrictEqual([]);
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

  expect(filterVersions(json, "1", "1", "1")).toStrictEqual(expected);
});
