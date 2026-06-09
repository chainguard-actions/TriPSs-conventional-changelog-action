'use strict'

// Pre-commit script for testing
// This script is called before the commit is made
// tagName is the new tag name
module.exports = async (tagName) => {
  console.log(`Pre-commit hook called with tag: ${tagName}`)
}
