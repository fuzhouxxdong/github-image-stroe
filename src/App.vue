<template>
    <div id="app">

        <a href="https://github.com/diycat" target="_blank">
            <img width="149" height="149"
                 style="position: absolute; top: 0; right: 0; border: 0;z-index:999999999"
                 src="https://github.blog/wp-content/uploads/2008/12/forkme_right_red_aa0000.png?resize=149%2C149"
                 class="attachment-full size-full"
                 alt="Fork me on GitHub"
                 data-recalc-dims="1">
        </a>

        <div class="hometab">
            <a class="homebutton" href="/">Home</a>
        </div>

        <header>
            <img src="/static/img/logo.png" alt="logo" style="margin: auto; display: block;">
        </header>

        <br>
        <br>

        <center>
            <div class="greeting">Uploads up to 20 MB are allowed. thank you...<br>a simple img store</div>
        </center>

        <br>
        <br>
        <!--style="border-color: rgb(35, 183, 72);"-->
        <center>
            <form method="post" @click="trigger"
                  enctype="multipart/form-data"
                  class="dropzone dz-clickable"
                  id="dropzoneUpload">
                <div class="dz-default dz-message"><span>Select or drop files</span></div>
                <div v-for="item in fileArrays" :key="item.url"
                     class="dz-preview dz-file-preview dz-processing  dz-complete"
                     :class="item.errmsg ? 'dz-error':'dz-success'"
                     @click.stop>
                    <div class="dz-details">
                        <div class="dz-filename"><span data-dz-name="123123">{{item.name}}</span></div>
                        <div class="dz-size" data-dz-size="12313">
                            <strong>{{item.size.selectedSize}}</strong>{{item.size.selectedUnit}}
                        </div>
                    </div>
                    <div class="dz-progress" v-if="!item.errmsg">
                        <span class="dz-upload" data-dz-uploadprogress=""
                              style="width: 100%; background-color: rgb(35, 183, 72);"></span>
                    </div>
                    <div class="dz-error-message" v-if="item.errmsg">
                        <span data-dz-errormessage="1231321">
                        {{item.errmsg}}
                        </span>
                    </div>
                    <div class="responseText" v-if="item.url">
                        <span class="textHolder" @click.stop="copy"
                              style="opacity: 1;">{{item.url}}</span>
                    </div>
                </div>
            </form>

        </center>

        <!--<div class="notetiny" style="margin-top: 25px;">a simple img store</div>-->

        <input type="file"
               ref="fileInput"
               accept="image/*"
               @change="createContents"
               multiple="multiple"
               class="dz-hidden-input"
               style="visibility: hidden; position: absolute; top: 0px; left: 0px; height: 0px; width: 0px;">

    </div>


</template>

<script>
    import axios from 'axios'
    import stringRandom from 'string-random'
    import {fileSize, grabTooBig, querySearch, queryStringify} from './utils/utils'

    export default {
        name: 'app',
        data: function () {
            return {
                fileArrays: []
            }
        },
        methods: {
            trigger: function () {
                this.$refs.fileInput.click();
            },
            copy: function (e) {
                var oldText = e.target.innerText;
                this.$copyText(oldText).then(function () {
                }, function () {
                });
                e.target.innerText = 'Copied!';
                setTimeout(function () {
                    e.target.innerText = oldText;
                }, 1000);
            },
            getAuthorize: function () {
                const clientID = this.github.client_id;
                const githubOauthUrl = 'http://github.com/login/oauth/authorize'
                const query = {
                    client_id: clientID,
                    redirect_uri: window.location.href,
                    scope: 'public_repo'
                }
                return `${githubOauthUrl}?${queryStringify(query)}`;
            },
            token: function () {
                const clientID = this.github.client_id;
                const clientSecret = this.github.client_secret;
                const url = 'https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token';
                const queryStr = querySearch();
                if (queryStr.code) {
                    const code = queryStr.code;
                    delete queryStr.code
                    const replacedUrl = `${window.location.origin}${window.location.pathname}${queryStringify(queryStr)}${window.location.hash}`
                    history.replaceState(null, null, replacedUrl)
                    axios.post(url, {
                        code: code,
                        client_id: clientID,
                        client_secret: clientSecret
                    }, {
                        headers: {
                            'Accept': 'application/json'
                        }
                    }).then(res => {
                        if (res) {
                            window.localStorage.setItem('access_token', res.data.access_token);
                        }
                    })
                }
            },
            createContents: function (e) {
                var thiz = this;
                const name = stringRandom();
                const url = `https://api.github.com/repos/${this.github.owner}/${this.github.repos}/contents/${name}.jpg`;
                const access_token = window.localStorage.getItem('access_token');
                const file = e.target.files[0];
                if (file) {
                    const result = {
                        name: file.name,
                        size: fileSize(file.size),
                    }
                    if (file.size > 20 * 1024 * 1024) {
                        result.errmsg = grabTooBig();
                        thiz.fileArrays.push(result);
                        thiz.fileArrays = thiz.fileArrays.reverse();
                    } else {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = function (e) {
                            const base64 = e.target.result;
                            axios.put(url, {
                                message: 'my commit message',
                                content: btoa(base64),
                                committer: {
                                    name: this.github.name,
                                    email: this.github.email
                                }
                            }, {
                                headers: {
                                    'Accept': 'application/json',
                                    Authorization: `token ${access_token}`
                                }
                            }).then(res => {
                                if (res.data) {
                                    result.url = res.data.content.download_url;
                                    thiz.fileArrays.push(result);
                                    thiz.fileArrays = thiz.fileArrays.reverse();
                                }
                            }).catch(function (error) {
                                if (error.response) {
                                    if (error.response.status === 401) {
                                        window.location.href = thiz.getAuthorize();
                                    }
                                    if (error.response.status === 404) {
                                        result.errmsg = '哦买噶Der! 只有本人才能上传哦！！！！';
                                        thiz.fileArrays.push(result);
                                    }
                                } else if (error.request) {
                                    console.log(error.request);
                                } else {
                                    console.log('Error', error.message);
                                }
                            });
                        }
                    }
                }
            }
        },
        created() {
            if (!localStorage.getItem('access_token')) {
                this.token();
            }
        }
    }
</script>

<style>


</style>
