/**
 * 开发模式下监听插件文件改变自动刷新
 */
const filesInDirectory = dir => new Promise(resolve =>
  dir.createReader().readEntries(entries =>
    Promise.all(entries.filter(e => e.name[0] !== '.').map(e =>
      e.isDirectory ?
        filesInDirectory(e) :
        new Promise(resolve => e.file(resolve))
    ))
      .then(files => [].concat(...files))
      .then(resolve)
  )
);

const timestampForFilesInDirectory = dir =>
  filesInDirectory(dir).then(files =>
    files.map(f => f.name + f.lastModifiedDate).join());

const reload = () => {
  // 自动刷新当前窗口的第1个固定标签页
  chrome.tabs.query({
    pinned: true,
    currentWindow: true
  }, tabs => {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id)
    }
    chrome.runtime.reload()
  })
};

const watchChanges = (dir, lastTimestamp) => {
  timestampForFilesInDirectory(dir).then(timestamp => {
    if (!lastTimestamp || (lastTimestamp === timestamp)) {
      setTimeout(() => watchChanges(dir, timestamp), 1000)
    } else {
      reload()
    }
  })
};

chrome.management.getSelf(self => {
  // 只在开发模式监听插件目录文件变化
  if (self.installType === 'development') {
    chrome.runtime.getPackageDirectoryEntry(dir => watchChanges(dir))
  }
});

/**
 * 插件安装完成给出版本号
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('网页结构化助手初始化完成.当前版本:', details.previousVersion);
  chrome.storage.sync.get(["installed"], data => {
    if (!data.installed) {
      chrome.storage.sync.set({
        installed: true
      });
    }
  });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostContains: '.amazon.' },
        })
      ],
      actions: [ new chrome.declarativeContent.ShowPageAction() ]
    }
    ]);
  });
});