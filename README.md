
<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->


<!-- PROJECT LOGO -->
<br />
<div align="center">


<h3 align="center">Choco-Mining Interface</h3>


</div>



<!-- ABOUT THE PROJECT -->
## About The Project



This project provides a web interface to facilitate the usage of the Choco-Mining solver and the SPMF library. It allows users to upload files, define constraints, and visualize the results of their computations.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Express][Express.js]][Express-url]
* [![TailwindCSS][TailwindCSS.com]][TailwindCSS-url]


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites



Before getting started, make sure you have the following software installed on your machine:

- [Maven](https://maven.apache.org/) - Dependency management tool for Java projects. 
- [Java](https://www.java.com/) - Programming language used for running Java applications.
- [Node.js](https://nodejs.org/) - JavaScript runtime environment for executing JavaScript code.

<br/>
<p align="center">
  <a href="https://maven.apache.org/">
    <img src="https://www.vectorlogo.zone/logos/apache_maven/apache_maven-icon.svg" alt="Maven" width="80" height="80">
  </a>
  <a href="https://www.java.com/">
    <img src="https://www.vectorlogo.zone/logos/java/java-icon.svg" alt="Java" width="80" height="80">
  </a>
  <a href="https://nodejs.org/">
    <img src="https://www.vectorlogo.zone/logos/nodejs/nodejs-icon.svg" alt="Node.js" width="80" height="80">
  </a>
  <a href="https://expressjs.com/">
    <img src="https://www.vectorlogo.zone/logos/expressjs/expressjs-icon.svg" alt="Express.js" width="80" height="80">
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" alt="Tailwind CSS" width="80" height="80">
  </a>
</p>

Make sure you have the latest versions of these software installed to ensure compatibility with the project.


### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/github_username/repo_name.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Build CSS using Tailwind
   ```sh
   npm run build:css
   ```
4. Go to javaRunner
   ```sh
   cd javaRunner
   ```
5. Install Maven dependencies
   ```sh
   mvn install
   ```
   ```
   cd ..
   ```
6. Start the server 
   ```sh
   node index.js
   ```




<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

Use this interface to easily set up and run computations with Choco-Mining and the SPMF library. Upload your data files, define constraints, and visualize the results in a user-friendly manner.



### Adding Constraints
If you want to add a constraint with its signatures, here is how to do it:
```
[
    {
        "name": "example_function",
        "signatures": [
            {
                "params": 3,
                "types": [
                    "IntVar",
                    "operator",
                    "IntVar_or_Pourcentage"
                ],
                "template": "model.arithm(${0}, \"${1}\", ${2}).post();"
            },
            {
                "params": 2,
                "types": [
                    "IntVar",
                    "IntVar_or_Pourcentage"
                ],
                "template": "model.add(model.scalarProduct(${0}, ${1})).post();"
            }
        ]
    }
]
```
Add the above JSON structure to your function.json file.



### Adding SPMF Algorithms

If you want to add an SPMF algorithm with its parameters, here is how to do it:
```
{
    "params" : 1,
    "types" : ["pourcentage"],
    "decs_param" : ["Le pourcentage de support pour le close"],
    "description" : "Mining Frequent Closed Itemsets", 
    "all_algo" : ["AprioriClose", "LCM"],
    "traductionEnContraintes" : "arithm(freq, >=, (int) Math.ceil(database.getNbTransactions() * ${0})) | coverClosure(database, x); | coverSize(database, freq, x)"
}
```

Add the above JSON structure to your algorithms.json file. The traductionEnContraintes field is optional and allows you to switch from simple mode to advanced mode and get the translation of the SPMF algorithm to Choco-Mining constraints.





<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the Apache License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Express](https://expressjs.com/)
* [TailwindCSS](https://tailwindcss.com/)
* [SPMF Library](http://www.philippe-fournier-viger.com/spmf/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/github_username/repo_name.svg?style=for-the-badge
[contributors-url]: https://github.com/github_username/repo_name/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/github_username/repo_name.svg?style=for-the-badge
[forks-url]: https://github.com/github_username/repo_name/network/members
[stars-shield]: https://img.shields.io/github/stars/github_username/repo_name.svg?style=for-the-badge
[stars-url]: https://github.com/github_username/repo_name/stargazers
[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge
[issues-url]: https://github.com/github_username/repo_name/issues
[license-shield]: https://img.shields.io/github/license/github_username/repo_name.svg?style=for-the-badge
[license-url]: https://github.com/github_username/repo_name/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
[Express.js]: https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white
[Express-url]: https://expressjs.com/
[TailwindCSS.com]: https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/

