<template>
    <div id="app">

        <div class="hometab">
            <a class="homebutton" href="/">Home</a>
        </div>
        <header>
            <img src="/static/img/logo.png" alt="logo" style="margin: auto; display: block;"></header>
        <br>
        <br>

        <center>
            <div class="greeting">Uploads up to 20 MB are allowed. thank you...</div>
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
                <div v-for="item in fileArrays" :key="item.url" class="dz-preview dz-file-preview dz-processing  dz-complete"
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

        <!--<div class="notetiny" style="margin-top: 25px;">hello world</div>-->

        <input type="file" ref="fileInput" accept="image/*" @change="createFile" multiple="multiple" class="dz-hidden-input"
               style="visibility: hidden; position: absolute; top: 0px; left: 0px; height: 0px; width: 0px;">

    </div>


</template>

<script>
    import axios from 'axios'
    import stringRandom from 'string-random'
    import {querySearch, queryStringify, fileSize,grabTooBig} from './components/utils'

    export default {
        name: 'app',
        data: function () {
            return {
                loginLink: 'Hello Vue!',
                isLogged: false,
                uploadFile: Object,
                fileArrays: []
            }
        },
        methods: {
            trigger: function () {
                this.$refs.fileInput.click();
            },
            copy: function (e) {
                var oldText = e.target.innerText;
                this.$copyText(oldText).then(function () {}, function () {});
                e.target.innerText = 'Copied!';
                setTimeout(function () {
                    e.target.innerText = oldText;
                }, 1000);
            },
            login: function () {
                const clientID = '9ba42a30e49015b1f1dc';
                const githubOauthUrl = 'http://github.com/login/oauth/authorize'
                const query = {
                    client_id: clientID,
                    redirect_uri: window.location.href,
                    scope: 'public_repo'
                }
                return `${githubOauthUrl}?${queryStringify(query)}`;
            },
            token: function () {
                const clientID = '9ba42a30e49015b1f1dc';
                const clientSecret = '70df2bd365c472a5ecaf1b741685bd14a0c4973b';
                const url = 'https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token';
                const queryStr = querySearch();
                if (queryStr.code) {
                    const code = queryStr.code;
                    delete queryStr.code
                    const replacedUrl = `${window.location.origin}${window.location.pathname}${queryStringify(queryStr)}${window.location.hash}`
                    history.replaceState(null, null, replacedUrl)
                    const thiz = this;
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
                            thiz.isLogged = true;
                        }
                    })
                }
            },
            issues: function () {
                const url = 'https://api.github.com/repos/diycat/diycat.github.io/issues';
                const access_token = window.localStorage.getItem('access_token');
                axios.post(url, {
                    title: 'Found a bug',
                    body: 'I\'m having a problem with this.',
                }, {
                    headers: {
                        'Accept': 'application/json',
                        Authorization: `token ${access_token}`
                    }
                }).then(res => {
                    alert(res)
                })
            },
            createFile: function (e) {
                var thiz = this;
                const name = stringRandom();
                const url = `https://api.github.com/repos/diycat/img/contents/${name}.jpg`;
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
                                    name: 'fuzhouxxdong',
                                    email: 'fuzhouxxdong@gmail.com'
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
                            })
                        }
                    }

                }

            }
        },
        created() {
            this.loginLink = this.login();
            if (localStorage.getItem('access_token')) {
                this.isLogged = true;
            } else {
                this.isLogged = false;
                this.token();
            }
        }
    }
</script>

<style>


</style>
