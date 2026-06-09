'use strict'

// Pre-changelog-generation script for testing
// This script is called before the changelog is generated
// version is the new version
module.exports = async (version) => {
  console.log(`Pre-changelog-generation hook called with version: ${version}`)
}
