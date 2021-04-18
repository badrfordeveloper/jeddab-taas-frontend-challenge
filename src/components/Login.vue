<template>
  <v-container fill-height>
    
    <v-alert
      dense
      type="error"
      class="fullwidth"
      v-if="alertErreur"
      dismissible
    >
      {{ erreurMessage }}
    </v-alert>
  <!--   if authorized -->
    <div v-if="authorized" class="fullwidth">
      <v-alert dense type="info" dismissible>
        Your github account was successfully authorized
      </v-alert>

      <v-row>

        <!-- repos -->
        <v-col cols="6" md="3" class="text-left">
          <v-data-iterator
            :items="items"
            :search="search"
            :sort-by="sortBy.toLowerCase()"
            :sort-desc="sortDesc"
            hide-default-footer
            :custom-filter="customFilter"
          >
            <template v-slot:header>
              <v-toolbar dark color="blue darken-3" class="mb-1">
                <v-text-field
                  v-model="search"
                  clearable
                  flat
                  solo-inverted
                  hide-details
                  prepend-inner-icon="mdi-magnify"
                  label="Search"
                ></v-text-field>
                <template v-if="$vuetify.breakpoint.mdAndUp">
                  <v-spacer></v-spacer>
                  <v-select
                    v-model="sortBy"
                    flat
                    solo-inverted
                    hide-details
                    :items="keys"
                    
                    label="Sort by"
                  ></v-select>
                </template>
              </v-toolbar>
            </template>

            <template v-slot:default="props">
              <v-card v-for="item in props.items" :key="item.name">
                <v-list-item @click="getBranches(item)">
                  <v-list-item-content>
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </template>
          </v-data-iterator>
        </v-col>
        <!-- select branches -->
        <v-col cols="12" sm="12" md="8">
          <div v-if="branches.length" fluid="false" class="text-left">
            <h2>{{ currentRepos }}</h2>
            <v-col cols="6" sm="12" md="2"
              ><v-select
                v-on:change="changeBranche"
                :items="branches"
                label="Select branch"
                item-text="name"
                v-model="selectedItem"
                max-width="150"
                solo
              ></v-select
            ></v-col>
            <!-- list of commits -->
            <div v-if="commits.length">
              <v-card v-for="(item, i) in commits" :key="i">
                <v-list-item three-line>
                  <v-list-item-content>
                    <v-list-item-title>
                      <v-row align="center" class="spacer" no-gutters>
                        <v-col cols="0" sm="0" md="0">
                          <v-avatar size="36px">
                            <img alt="Avatar" :src="item.avatar_url" />
                          </v-avatar>
                        </v-col>

                        <v-col class="hidden-xs-only" sm="5" md="3">
                          <strong class="name">{{ item.name }} </strong>
                          committed
                          {{ moment(item.date).format("MM/DD/YYYY hh:mm") }}
                        </v-col>
                      </v-row>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <strong> Message : {{ item.message }}</strong>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
<!--   if not authorized -->
    <v-layout align-center justify-center v-if="!authorized">
      <v-flex xs12 sm8 md3>
        <v-btn
          class="primary"
          href="https://github.com/login/oauth/authorize?client_id=Iv1.1b16558eb9485da0"
          >login</v-btn
        >
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import moment from "moment";
export default {
  data: () => ({
    alertErreur: false,
    erreurMessage: "",
    authorized: false,
    user: [],
    items: [],
    branches: [],
    commits: [],
    selectedItem: "",
    search: "",
    itemsPerPageArray: [4, 8, 12],

    filter: {},
    sortDesc: false,
    page: 1,
    itemsPerPage: 4,
    sortBy: "name",
    keys: ["name", "id"],
    currentCommitsUrl: "",
    currentRepos: "",
    client_id: "Iv1.1b16558eb9485da0",
     client_secret: "2dd4659eb59a283df20b01e921a91479cfec6abc",
  }),
  async created() {
    // check if the url has code params
    if (this.$route.query.code && !this.authorized) {

      var flagAccessToken = false;
      var flagUser = false;
      var accessToken = "";

      // to get the resultat in format json to acces to the access_token
      const headers = {
        Accept: "application/json",
      };

      //get the access_token
      await this.$axios
        .post(
          "https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token",
          {
            client_id: this.client_id,
            client_secret: this.client_secret,
            code: this.$route.query.code,
          },
          {
            headers: headers,
          }
        )
        .then(function (res) {
          flagAccessToken = true;
          accessToken = res.data.access_token;
        })
        .catch((error) => {
          this.erreurMessage = "Something Wrong";
          this.alertErreur = true;
          console.log(error);
        });

      if (flagAccessToken) {
        // i use https://cors-anywhere.herokuapp.com/ cause of problem of the localhost (untrusted src for github)
        // get the infos of user using the accessToken
        await this.$axios
          .get(
            "https://cors-anywhere.herokuapp.com/https://api.github.com/user",
            {
              headers: {
                Authorization: `token ${accessToken}`,
              },
            }
          )
          .then((resultat) => {
            this.authorized = true;
            this.user = resultat.data;
            flagUser = true;
          })
          .catch((error) => {
            this.erreurMessage = "Something Wrong";
            this.alertErreur = true;
            console.log(error);
          });
      }
      // get the list of repos  by the token access
      if (flagUser) {
        await this.$axios
          .get(this.user.repos_url, {
            headers: {
              Authorization: `token ${accessToken}`,
            },
          })
          .then((resultat2) => {
            // select the needed attribute
            this.items = resultat2.data.map((obj) => {
              return {
                id: obj.id,
                name: obj.name,
                branches_url: obj.branches_url.slice(0, -9),
                commits_url: obj.commits_url.slice(0, -6),
              };
            });
          })
          .catch((error) => {
            this.erreurMessage = "Something Wrong";
            this.alertErreur = true;
            console.log(error);
          });
      }
    }
  },

  methods: {
    moment,
    //get branches
    async getBranches(item) {
      this.selectedItem = "";
        await this.$axios.get(item.branches_url).then((res) => {
             this.branches = res.data
          .map((obj) => {
             // select the needed attribute , filter boolean remove the undefined
            if (!obj.name.includes("dependabot")) {
              return {
                name: obj.name,
              };
            }
          })
          .filter(Boolean);
          // the url of commits of repos
        this.currentCommitsUrl = item.commits_url;
        //new repos
        this.currentRepos = item.name;
        //reset commits
        this.commits = [];

          })
          .catch((error) => {
            this.erreurMessage = "Something Wrong";
            this.alertErreur = true;
            console.log(error);
          });
    },
    // get commits
    async changeBranche(branche) {
      // get commits of branch
      const url = this.currentCommitsUrl + "?sha=" + branche;
       await this.$axios.get(url)
       .then((res) => {
          // select the needed attribute
             this.commits = res.data.map((obj) => {
          return {
            name: obj.commit.committer.name,
            date: obj.commit.committer.date,
            message: obj.commit.message,
            avatar_url: obj.committer.avatar_url,
          };
        });
          })
          .catch((error) => {
            this.erreurMessage = "Something Wrong";
            this.alertErreur = true;
            console.log(error);
          });

   
    },
    customFilter(items, search) {

            search = search.toString().toLowerCase()
           
            return items.filter(row => {
               return (row.name.toString().toLowerCase().includes(search))
            });

        }
  },
  computed: {
     filteredItems() {
      return this.items.filter((i) => {
        console.log(i)
        return !this.name ;
      })
    },

    //filter data interior
    filteredKeys() {
      return this.keys.filter((key) =>
       {
        return key !== "Name"}
       );
    },
  },
};
</script>

<style scoped>
.fullwidth {
  width: 100%;
}
.name {
  margin-left: 10px;
}
</style>
