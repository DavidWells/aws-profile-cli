const path = require('path')
const fs = require('fs')
const DEBUG = false

/*
 * Returns object of AWS profiles
 * This originally has been copied from
 * https://github.com/aws/aws-sdk-js/blob/master/lib/util.js#L176-L195
 */
function getProfiles(name) {
  const fileContents = getAWSCredentialsFile()
  const profiles = {}
  if (!fileContents) {
    return null
  }
  const lines = fileContents.split(/\r?\n/)
  let currentSection
  lines.forEach((line) => {
    const lineData = removeCommentsFromString(line)
    const section = lineData.match(/^\s*\[([^[\]]+)]\s*$/)
    if (section) {
      currentSection = section[1]
    } else if (currentSection) {
      const item = lineData.match(/^\s*(.+?)\s*=\s*(.+?)\s*$/)
      if (item) {
        profiles[currentSection] = profiles[currentSection] || {}
        profiles[currentSection][item[1]] = item[2]
      }
    }
  })
  if (name) {
    if (!profiles[name]) {
      throw new Error(`No profile [${name}] found`)
    }
    return profiles[name]
  }
  return profiles
}

function createProfile({ profile, aws_access_key_id, aws_secret_access_key }) {
  console.log(`Creating [${profile}] profile`)
  const profileData = getProfileData(profile)
  if (profileData) {
    console.log(`[${profile}] already exists. exit`)
    // Profile Already Exists! Return error
    return false
  }
  if (profile && aws_access_key_id && aws_secret_access_key) {
    return appendAWSCredentials({
      profile,
      awsAccessKeyId: aws_access_key_id,
      awsSecretAccessKey: aws_secret_access_key
    })
  }
  // missing values return error
  return false
}

function updateProfile(profileName, newValues) {
  console.log(`Updating [${profileName}] profile data with new values`)
  const filePath = getAWSCredentialsPath()
  let creds = getAWSCredentialsFile()
  const currentCredsData = getProfileData(profileName)
  if (currentCredsData) {
    const {
      accessKey,
      accessKeyRawText,
      secretAccessKey,
      secretAccessKeyRawText
    } = currentCredsData
    const key = newValues.aws_access_key_id
    const secret = newValues.aws_secret_access_key

    // if key is new, replace the old one
    if (key && key !== accessKey) {
      creds = creds.replace(accessKeyRawText, `aws_access_key_id=${key}`)
    }
    // if secret is new, replace the old one
    if (secret && secret !== secretAccessKey) {
      creds = creds.replace(secretAccessKeyRawText, `aws_secret_access_key=${secret}`)
    }
    atomicWriteFileSync(filePath, creds)
    return getProfiles()
  }
  // no profile matches return false
  return false
}


function areEqual(profile, secondProfile) {
  return profile.accessKey === secondProfile.accessKey && profile.secretAccessKey === secondProfile.secretAccessKey
}


function replaceDefaultProfile(newDefaultProfileName) {
  console.log(`Replacing [default] profile creds with [${newDefaultProfileName}] creds`)
  const defaultProfile = getProfileData('default')
  if (!defaultProfile) {
    throw new Error('No default profile found. Please check your creds')
  }
  const newDefaultProfile = getProfileData(newDefaultProfileName)
  if (!newDefaultProfile) {
    throw new Error(`No "${newDefaultProfileName}" profile found. Please check your creds`)
  }

  if (areEqual(defaultProfile, newDefaultProfile)) {
    console.log(`[${newDefaultProfileName}] is already set as [default]`)
    return false
  }

  const newRawData = newDefaultProfile.rawText.replace(/^\s*\[([^[\]]+)]/, `[default]`)
  // Todo future save previous default
  // const setPreviousDefault = defaultProfile.rawText.replace(/^\s*\[([^[\]]+)]/, `[previousDefault]`)
  const filePath = getAWSCredentialsPath()
  const fileContents = getAWSCredentialsFile()

  const newDefault = `${newRawData}\n`.replace(/[\r\n]+/g, '\n')
  const newCredsFile = fileContents.replace(defaultProfile.rawText, newDefault)
  atomicWriteFileSync(filePath, newCredsFile)
  console.log(`Successfully replaced [default] profile with [${newDefaultProfileName}]`)
  return getProfiles()
}

function deleteAWSProfile(profileName) {
  console.log(`Deleting [${profileName}] profile data`)
  const filePath = getAWSCredentialsPath()
  const fileContents = getAWSCredentialsFile()
  const profileData = getProfileData(profileName)
  if (!profileData) {
    throw new Error(`No "${newDefaultProfileName}" profile found. Please check your creds`)
  }
  const newContent = fileContents.replace(profileData.rawText, '')
  atomicWriteFileSync(filePath, newContent)
  console.log(`Successfully deleted [${profileName}] profile`)
  return getProfiles()
}

// TODO use this regex to find/replace default values in file
function getProfileData(profileName) {
  // console.log(`Getting [${profileName}] profile data`)
  const awsCredentialsFile = getAWSCredentialsFile()
  /* pattern /^\s*\[default((.|\n)*?.*^(\[|\s)/gm */
  const pattern = new RegExp(`^\s*\\[${profileName}((.|\\n)*?.*^(\\[|\\s))`, "gm") // eslint-disable-line
  const creds = awsCredentialsFile.match(pattern)
  if (creds) {
    const accessKey = getAccessKey(creds[0])
    const secretKey = getSecretAccessKey(creds[0])
    if (DEBUG) {
      // eslint-disable-next-line
      console.log('creds match', creds)
      // eslint-disable-next-line
      console.log('accessKey string', accessKey[0])
      // eslint-disable-next-line
      console.log('secretKey string', secretKey[0])
    }

    if (!accessKey || !secretKey) {
      // might need to throw error here
      return false
    }

    return {
      rawText: creds[0].slice(0, -1), // remove trailing [
      accessKey: accessKey[1], // value
      accessKeyRawText: accessKey[0], // for easy find/replace
      secretAccessKey: secretKey[1], // value
      secretAccessKeyRawText: secretKey[0] // for easy find/replace
    }
  }
  // Single or last value in the file. regex above doesnt match ending or single profiles
  const singlePattern = new RegExp(`^\s*\\[${profileName}(.|\\n)*`, "gm") // eslint-disable-line
  const singleCreds = awsCredentialsFile.match(singlePattern)
  // console.log(singleCreds)
  if (singleCreds) {
    const accessKey = getAccessKey(singleCreds[0])
    const secretKey = getSecretAccessKey(singleCreds[0])
    if (!accessKey || !secretKey) {
      return false
    }
    if (DEBUG) {
      // eslint-disable-next-line
      console.log('accessKey string', accessKey[0])
      // eslint-disable-next-line
      console.log('secretKey string', secretKey[0])
    }
    // do replacements
    return {
      rawText: singleCreds[0], // for easy find/replace
      accessKey: accessKey[1], // value
      accessKeyRawText: accessKey[0], // for easy find/replace
      secretAccessKey: secretKey[1], // value
      secretAccessKeyRawText: secretKey[0] // for easy find/replace
    }
  }

  return false
}

function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true
  }
  ensureDirectoryExists(dirname)
  fs.mkdirSync(dirname)
}

const appendAWSCredentials = ({ profile, awsAccessKeyId, awsSecretAccessKey }) => {
  const credentialsPath = getAWSCredentialsPath()
  // ensure that .aws folder exists
  ensureDirectoryExists(credentialsPath)

  try {
    const content = [
      `[${profile}]\n`,
      `aws_access_key_id=${awsAccessKeyId}\n`,
      `aws_secret_access_key=${awsSecretAccessKey}\n\n`
    ].join('')
    fs.appendFileSync(credentialsPath, content)
    return getProfiles()
  } catch (err) {
    console.log(err)
    return {}
  }
}

/* Returns string of path to aws file */
const getAWSCredentialsPath = () => {
  const { env } = process
  const home = env.HOME || env.USERPROFILE || (env.HOMEPATH ? ((env.HOMEDRIVE || 'C:/') + env.HOMEPATH) : null)
  if (!home) {
    throw new Error('Can\'t find home directory on your local file system.')
  }
  return path.join(home, '.aws', 'credentials')
}

/* Returns string of contents of aws crendentials file */
const getAWSCredentialsFile = () => {
  const credentialsPath = getAWSCredentialsPath()
  try {
    return fs.readFileSync(credentialsPath).toString()
  } catch (err) {
    return false
  }
}

/* Returns array */
function getAccessKey(text) {
  return text.match(/^aws_access_key_id=([a-zA-Z0-9\S]*)/m)
}
/* Returns array */
function getSecretAccessKey(text) {
  return text.match(/^aws_secret_access_key=([a-zA-Z0-9\S]*)/m)
}
/* Returns string minus comments */
function removeCommentsFromString(text) {
  return (text) ? text.split(/(^|\s)[;#]/)[0] : ''
}

function atomicWriteFileSync(filepath, content, callback) {
  const randomId = backupID()
  const backupPath = `${filepath}.${randomId}.bak`
  try {
    fs.writeFileSync(backupPath, content)
  } catch (e) {
    throw e
  }
  try {
    // TODO check for write access
    fs.renameSync(backupPath, filepath)
  } catch (e) {
    throw e
  }
  if (callback) {
    callback()
  }
}

function rand() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
}

function backupID() {
  return `local-${rand()}${rand()}-${rand()}`
}

module.exports = {
  // Profile File Manipulation
  createProfile: createProfile,
  readProfile: getProfiles,
  updateProfile: updateProfile,
  deleteProfile: deleteAWSProfile,
  // Replace default profile on machine
  replaceDefaultProfile: replaceDefaultProfile,
  // Getters
  getProfiles: getProfiles,
  getProfileData: getProfileData,
  // file utils
  getAWSCredentialsPath: getAWSCredentialsPath,
  getAWSCredentialsFile: getAWSCredentialsFile
}
