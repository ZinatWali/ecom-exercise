# Customer order app using React

This project is provisioned and hosted using AWS Amplify. It has a React front end that communicates with Node JS Lambda functions in the back end via API gateway. The front end application uses Cognito user pool for managing user authentication. The lambda functions use Dynamo DB tables for storing order and inventory details. 

This was a quick demo code produced within a limited amount of time. The backend data models are not comprehensive and Amplify was used to expedite infrastructure provisioning. Amplify uses CloudFormation under the hood and the CloudFormation scripts are available in the repo. A working demo is available on request.

While Amplify was used for the backend infrastructure and Lambda codes, the React code is entirely bespoke.  

