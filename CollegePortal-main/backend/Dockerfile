FROM maven:3.9.6-eclipse-temurin-21

WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests

EXPOSE 8082

ENTRYPOINT ["sh", "-c", "java -jar target/*.jar"]
