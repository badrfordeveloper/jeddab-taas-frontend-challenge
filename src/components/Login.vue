<template>
  <v-container  fill-height>
    <div v-if="authorized" class="fullwidth">

      <v-alert dense type="info">
        Your github accout was successfully authorized
      </v-alert>

         <v-row >
            <v-col
        cols="6"
        md="3"
         class="text-left"
      >
          <v-data-iterator
        :items="items"
        :search="search"
        :sort-by="sortBy.toLowerCase()"
        :sort-desc="sortDesc"
        hide-default-footer
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
                prepend-inner-icon="mdi-magnify"
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
      <v-col
        cols="12"
        sm="12"
        md="8"
      >
      <div  v-if="branches.length" fluid="false"  class="text-left">
        <h2>{{currentRepos}}</h2>
         <v-col
        cols="6"
        sm="12"
        md="2"
      ><v-select
      v-on:change="changeBranche"
          :items="branches"
          label="Select branch"
           item-text="name"
           v-model="selectedItem"
           max-width=150


          solo
        ></v-select></v-col>
         
        <div  v-if="commits.length" >
          <v-card  v-for="(item, i) in commits" :key="i" >
              <v-list-item three-line >
                <v-list-item-content >
                  <v-list-item-title> 
                      <v-row
              align="center"
              class="spacer"
              no-gutters
            >
                      <v-col
                cols="0"
                sm="0"
                md="0"

              >
                <v-avatar
                  size="36px"
                >
                  <img
                    alt="Avatar"
                    :src="item.avatar_url"
                  >
                </v-avatar>
              </v-col>
              
              <v-col
                class="hidden-xs-only"
                sm="5"
                md="3"
              >
                <strong class="name">{{ item.name }} </strong> committed {{moment(item.date).format('MM/DD/YYYY hh:mm')}} 
              
              </v-col>
                      </v-row>

                   </v-list-item-title>
                  <v-list-item-subtitle>
                   <strong > Message : {{ item.message }}</strong >
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
          </v-card>

        </div>
      </div>
      </v-col>
     
    </v-row>

    

     

         

    </div>

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
import moment from 'moment'
export default {
  
  data: () => ({
    authorized: false,
    user: [],
    items: [],
    branches: [],
    commits: [],
    selectedItem:"",
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
    obj: {
      email: "",
      password: "",
    },
  }),
  async created() {
    if (this.$route.query.code && !this.authorized) {
      const headers = {
        Accept: "application/json",
      };
      const res = await this.$axios.post(
        "https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token",
        {
          client_id: "Iv1.1b16558eb9485da0",
          client_secret: "2dd4659eb59a283df20b01e921a91479cfec6abc",
          code: this.$route.query.code,
        },
        {
          headers: headers,
        }
      );

      console.log(res.data.access_token);

      const headers2 = {
        Authorization: `token ${res.data.access_token}`,
      };

      const resultat = await this.$axios.get(
        "https://cors-anywhere.herokuapp.com/https://api.github.com/user",
        {
          headers: headers2,
        }
      );
      this.user = resultat.data;
      this.authorized = true;

      const resultat2 = await this.$axios.get(this.user.repos_url, {
        headers: headers2,
      });
      this.items = resultat2.data.map((obj) => {
        return {
          id: obj.id,
          name: obj.name,
          branches_url: obj.branches_url.slice(0, -9),
          commits_url: obj.commits_url.slice(0, -6),
        };
      });
    }
  },

  methods: {
    moment,
    async getBranches(item) {
      
      this.selectedItem="";
      const res = await this.$axios.get(item.branches_url);
      
      if (res.status === 200) {
        this.branches = res.data
          .map((obj) => {
            if (!obj.name.includes("dependabot")) {
              return {
                name: obj.name,
                /*  branches_url:obj.branches_url.slice(0, -9) */
              };
            }
          })
          .filter(Boolean);
          this.currentCommitsUrl=item.commits_url;
          this.currentRepos=item.name;
          this.commits=[];
      }
    },
    // get commits
    async changeBranche(branche){
      const url=this.currentCommitsUrl+"?sha="+branche;
        const res = await this.$axios.get(url);
      
      if (res.status === 200) {
        this.commits = res.data
          .map((obj) => {
      
              return {
                name: obj.commit.committer.name,
                date: obj.commit.committer.date,
                message: obj.commit.message,
                avatar_url: obj.committer.avatar_url,
              };
            
          })
      }

    },
  },
  computed: {
    filteredKeys() {
      return this.keys.filter((key) => key !== "Name");
    },
  },
};
</script>

<style scoped>
.fullwidth{
  width: 100%;
}
.name{
  margin-left: 10px;
}
</style>
