<template>
  <div id="amz-eye-plugin">
    <div class="logo">
      <span class="brand"><img :src="logo" height="30"></span>
    </div>
    <ul class="amz-eye-topbar">
      <li>
        <a style="padding: 4px;">
          <input type="text" id="amz-eye-autocomplete" :placeholder="topbar.search_string" style="width: 100%">
        </a>
      </li>
      <li>
        <a>页面扩展</a>
        <ul>
          <li>
            <a>显示商品详情</a>
          </li>
          <li>
            <a><input type="checkbox">评论列表关键字高亮</a>
          </li>
          <li>
            <a><input type="checkbox">单页显示评论列表</a>
          </li>
          <li>
            <a><input type="checkbox">单页显示商品列表</a>
          </li>
          <li>
            <a><input type="checkbox">新标签页打开链接</a>
          </li>
          <li>
            <a><input type="checkbox">商品广告醒目标记</a>
          </li>
          <li>
            <a><input type="checkbox">仅展示销量排行</a>
          </li>
          <li>
            <a><input type="checkbox">允许过滤商品</a>
          </li>
          <li>
            <a><input type="checkbox">不显示广告商品</a>
          </li>
          <li>
            <a><input type="checkbox">不显示亚马逊商品</a>
          </li>
          <li>
            <a><input type="checkbox">醒目标记跟踪商品</a>
          </li>
          <li>
            <a><input type="checkbox">增加更多搜索排序条件</a>
          </li>
        </ul>
      </li>
      <li>
        <a>导出数据</a>
        <ul>
          <li><a>下载电子表格(Excel)</a></li>
          <li><a>导出到谷歌电子表格</a></li>
        </ul>
      </li>
      <li>
        <a>高级搜索</a>
      </li>
      <li>
        <a>{{topbar.dataCollect}}</a>
        <ul>
          <li><a>本地采集</a></li>
          <li><a>云端采集</a></li>
        </ul>
      </li>
      <li>
        <a>{{topbar.navigation}}</a>
        <ul>
          <li>
            <a>{{topbar.amazonHome}}</a>
          </li>
        </ul>
      </li>
      <li>
        <a>设置</a>
        <ul>
          <li><a><input type="checkbox">显示回到顶部按钮</a></li>
          <li><a>代理服务</a></li>
          <li><a>存储服务</a></li>
          <li><a>商品标签库</a></li>
          <li><a>跟踪商品库</a></li>
          <li><a>清理缓存</a></li>
          <li><a>同步配置</a></li>
        </ul>
      </li>
    </ul>
    <div class="right">
      <div class="user-menu">
        <a>登录</a>
      </div>
    </div>
    <extra-info :title="title" ref="amzExtraInfo"></extra-info>
  </div>
</template>

<script lang="babel" type="text/babel">
  import {config} from '../utils/storage';
  import ExtraInfo from './components/ExtraInfo.vue';

  export default {
    data() {
      return {
        logo: chrome.runtime.getURL('images/logo.png'),
        topbar: {
          search_string: chrome.i18n.getMessage("topbar_search_string"),
          navigation: chrome.i18n.getMessage("topbar_navigation"),
          dataCollect: chrome.i18n.getMessage("topbar_data_collect"),
          amazonHome: chrome.i18n.getMessage("topbar_amazon_home"),
        },
        title: 'ExtraInfo'
      };
    },
    mounted() {
      chrome.runtime.onMessage.addListener((message, sender, response) => {

      });

      let extraInfo = $(this.$refs.amzExtraInfo.$el);
      extraInfo.show();
      extraInfo.appendTo('.zg_itemWrapper');
    },
    components: {
      ExtraInfo: ExtraInfo
    }
  };
</script>

<style lang="stylus" type="text/scss">
  body {
    padding-top: 40px !important;
  }

  #amz-eye-plugin {
    position: fixed;
    top: 0;
    width: 100%;
    height: 41px;
    display: flex;
    align-items: center;
    background: rgba(255, 165, 0, 0.78);
    border-bottom: 1px solid #ff920f;
    font-size: 14px;
    color: #fff;
    padding: 0 10px;
    z-index: 10086;
    .logo {
      margin-right: 10px;
      display: inline-table;
      .brand {
        font-size: 18px;
        font-weight: 700;
      }
      .version {
        position: relative;
        vertical-align: bottom;
      }
    }
    .amz-eye-topbar {
      list-style-type: none;
      margin: 0;
      padding: 0;
      width: 100%;
      height: 41px;
      overflow: hidden;
      li {
        float: left;
        border-right: 1px solid rgb(255, 165, 0);
        list-style-type: none;
        a {
          display: block;
          padding: 10px 12px;
          color: #fff;
          text-decoration: none;
          &:hover {
            background: rgba(255, 217, 123, 0.78);
          }
          #amz-eye-autocomplete {
            /*height: 24px !important;*/
          }
        }
        &:hover {
          ul {
            display: block;
          }
        }
        ul {
          display: none;
          position: absolute;
          background: rgba(255, 165, 0, 0.88);
          border: 1px solid rgb(255, 165, 0);
          list-style-type: none;
          margin: 0;
          padding: 0;
          li {
            float: none;
            border-right: none;
            width: 200px;
            list-style-type: none;
            a {
              border-top: 1px solid rgb(255, 165, 0);
            }
          }
        }
      }
    }
    .right {
      float: right;
      width: 10%;
      .user-menu {
        float: right;
        a {
          color: #fff;
        }
      }
    }
  }
</style>
