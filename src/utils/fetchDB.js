const dbRoute = {
  projectDBRoute: "/src/DB/dataProjectsDB.json",
  nodeDBRoute: "/src/DB/dataNodesDB.json",
};
Date.prototype.toISOString = function () {
  let pad = (n) => (n < 10 ? "0" + n : n);
  let hours_offset = this.getTimezoneOffset() / 60;
  let offset_date = this.setHours(this.getHours() - hours_offset);
  let symbol = hours_offset >= 0 ? "-" : "+";
  let time_zone = symbol + pad(Math.abs(hours_offset)) + ":00";

  return (
    this.getUTCFullYear() +
    "-" +
    pad(this.getUTCMonth() + 1) +
    "-" +
    pad(this.getUTCDate()) +
    "T" +
    pad(this.getUTCHours()) +
    ":" +
    pad(this.getUTCMinutes()) +
    ":" +
    pad(this.getUTCSeconds()) +
    "." +
    (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
    time_zone
  );
};
const fetchProjectsDB = async function (storageType, name) {
  //name="projectsDB"
  console.log(`fetching ${name}`);
  switch (storageType) {
    case "localStorage":
      return JSON.parse(localStorage.getItem(name)) || [];
    case "DB":
      try {
        const projects = await (await fetch(dbRoute.projectDBRoute)).json();
        return projects;
      } catch (err) {
        throw err;
      }
  }
};
const fetchSelectedNodesDB = async function (storageType, selectedProjectID) {
  switch (storageType) {
    case "localStorage":
      return JSON.parse(localStorage.getItem(selectedProjectID));
    case "DB":
      const nodesDB = await (await fetch(dbRoute.nodeDBRoute))?.json();
      const selectedProjectNodesID = (
        await fetchProjectsDB(storageType, "projectsDB")
      ).filter((project) => project.id === selectedProjectID)[0]?.nodesID;
      return nodesDB.filter((node) =>
        selectedProjectNodesID?.includes(node.id)
      );
  }
};

export default {
  fetchProjectsDB,
  fetchSelectedNodesDB,
};
