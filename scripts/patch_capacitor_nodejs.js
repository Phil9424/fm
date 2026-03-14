const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const pluginDir = path.join(rootDir, "package");
const gradleFile = path.join(pluginDir, "android", "build.gradle");
const nativeFile = path.join(pluginDir, "android", "src", "main", "cpp", "native-lib.cpp");

function ensurePatchedBuildGradle() {
  if (!fs.existsSync(gradleFile)) {
    return false;
  }
  let content = fs.readFileSync(gradleFile, "utf8");
  if (!content.includes('namespace "net.hampoelz.capacitor.nodejs"')) {
    content = content.replace("android {\n", "android {\n    namespace \"net.hampoelz.capacitor.nodejs\"\n");
    fs.writeFileSync(gradleFile, content);
  }
  return true;
}

function ensurePatchedNativeBridge() {
  if (!fs.existsSync(nativeFile)) {
    return false;
  }
  const content = fs.readFileSync(nativeFile, "utf8");
  if (content.includes("cacheJavaVm") && content.includes("AttachCurrentThread")) {
    return true;
  }

  const patched = content
    .replace("JNIEnv *cacheEnvPointer = NULL;\njobject cacheClassObject = NULL;\n", "JavaVM *cacheJavaVm = NULL;\njobject cacheClassObject = NULL;\n")
    .replace(
      `void receiveMessageFromNode(const char *channelName, const char *channelMessage)
{
    JNIEnv *env = cacheEnvPointer;
    jobject object = cacheClassObject;

    if (!env || !object)
        return;
`,
      `void receiveMessageFromNode(const char *channelName, const char *channelMessage)
{
    if (!cacheJavaVm || !cacheClassObject)
        return;

    JNIEnv *env = NULL;
    bool detachThread = false;
    jint getEnvResult = cacheJavaVm->GetEnv(reinterpret_cast<void **>(&env), JNI_VERSION_1_6);
    if (getEnvResult == JNI_EDETACHED)
    {
        if (cacheJavaVm->AttachCurrentThread(&env, nullptr) != JNI_OK)
            return;
        detachThread = true;
    }
    else if (getEnvResult != JNI_OK || !env)
    {
        return;
    }

    jobject object = cacheClassObject;
`
    )
    .replace(
      "        env->DeleteLocalRef(javaClass);\n    }\n}\n",
      "        env->DeleteLocalRef(javaClass);\n    }\n\n    if (detachThread)\n    {\n        cacheJavaVm->DetachCurrentThread();\n    }\n}\n"
    )
    .replace(
      `    RegisterCallback(&receiveMessageFromNode);

    cacheEnvPointer = env;
    cacheClassObject = object;
`,
      `    RegisterCallback(&receiveMessageFromNode);

    env->GetJavaVM(&cacheJavaVm);
    if (cacheClassObject != NULL)
    {
        env->DeleteGlobalRef(cacheClassObject);
    }
    cacheClassObject = env->NewGlobalRef(object);
`
    )
    .replace(
      "    return jint(exitCode);\n}\n",
      "    return jint(exitCode);\n}\n\nJNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *)\n{\n    cacheJavaVm = vm;\n    return JNI_VERSION_1_6;\n}\n"
    );

  fs.writeFileSync(nativeFile, patched);
  return true;
}

function main() {
  const gradlePatched = ensurePatchedBuildGradle();
  const nativePatched = ensurePatchedNativeBridge();
  if (!gradlePatched || !nativePatched) {
    console.warn("capacitor-nodejs patch skipped: extracted package sources not found in ./package");
    return;
  }
  console.log("capacitor-nodejs Android sources patched");
}

main();
