# ─────────────────────────────────────────────────────────────────────────────
# Casciz Commerce OS – Backend Dockerfile (multi-stage)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Cache Maven dependencies before copying source
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn -f pom.xml dependency:go-offline -B

COPY src ./src

RUN --mount=type=cache,target=/root/.m2 \
    mvn -f pom.xml package -DskipTests -B && \
    java -Djarmode=layertools -jar target/casciz-commerce-os.jar extract --destination target/extracted

# ── Stage 2: Development (with hot-reload via spring-boot-devtools) ──────────
FROM eclipse-temurin:21-jdk-alpine AS development

WORKDIR /app

RUN addgroup -S casciz && adduser -S casciz -G casciz

COPY --from=builder /build/target/casciz-commerce-os.jar app.jar

USER casciz

EXPOSE 8080 5005

ENTRYPOINT ["java", \
    "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005", \
    "-jar", "app.jar"]

# ── Stage 3: Production (layered JAR for fast startup) ───────────────────────
FROM eclipse-temurin:21-jre-alpine AS production

WORKDIR /app

RUN addgroup -S casciz && adduser -S casciz -G casciz && \
    mkdir -p /app/logs && chown -R casciz:casciz /app

COPY --from=builder --chown=casciz:casciz /build/target/extracted/dependencies/          ./
COPY --from=builder --chown=casciz:casciz /build/target/extracted/spring-boot-loader/    ./
COPY --from=builder --chown=casciz:casciz /build/target/extracted/snapshot-dependencies/ ./
COPY --from=builder --chown=casciz:casciz /build/target/extracted/application/           ./

USER casciz

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+UseG1GC", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "org.springframework.boot.loader.launch.JarLauncher"]
