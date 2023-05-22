const exportData = function (storageType, data, name) {
  console.log(`saving ${name}...`);
  switch (storageType) {
    case "localStorage":
      try {
        localStorage.setItem(name, JSON.stringify(data));
        console.log(`${name} data saved`);
      } catch (err) {
        (err) => {
          throw err;
        };
      }
      break;
    case "DB":
      break;
  }
};

export default { exportData };
