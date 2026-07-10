package com.casciz.commerceos;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;

/**
 * Enforces clean architecture dependency rules at build time.
 * Fails the build if any layer imports from a layer it must not depend on.
 */
@DisplayName("Clean Architecture Constraints")
class ArchitectureTest {

    private static JavaClasses classes;

    @BeforeAll
    static void importClasses() {
        classes = new ClassFileImporter()
                .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                .importPackages("com.casciz.commerceos");
    }

    @Test
    @DisplayName("Layers respect dependency direction")
    void layerDependenciesAreRespected() {
        ArchRule rule = layeredArchitecture()
                .consideringAllDependencies()
                .layer("Presentation")  .definedBy("com.casciz.commerceos.presentation..")
                .layer("Application")   .definedBy("com.casciz.commerceos.application..")
                .layer("Domain")        .definedBy("com.casciz.commerceos.domain..")
                .layer("Infrastructure").definedBy("com.casciz.commerceos.infrastructure..")
                .layer("Shared")        .definedBy("com.casciz.commerceos.shared..")

                .whereLayer("Presentation")  .mayOnlyAccessLayers("Application", "Domain", "Shared", "Infrastructure")
                .whereLayer("Application")   .mayOnlyAccessLayers("Domain", "Shared")
                .whereLayer("Domain")        .mayOnlyAccessLayers("Shared")
                .whereLayer("Infrastructure").mayOnlyAccessLayers("Domain", "Application", "Shared");

        rule.check(classes);
    }

    @Test
    @DisplayName("Domain layer has no Spring Framework dependencies")
    void domainHasNoSpringDependencies() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("com.casciz.commerceos.domain..")
                .should().dependOnClassesThat()
                .resideInAnyPackage(
                        "org.springframework.web..",
                        "org.springframework.security..",
                        "org.springframework.data.jpa.."
                )
                .because("Domain layer must be framework-agnostic");

        rule.check(classes);
    }

    @Test
    @DisplayName("Application layer has no web layer dependencies")
    void applicationHasNoWebDependencies() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("com.casciz.commerceos.application..")
                .should().dependOnClassesThat()
                .resideInAPackage("org.springframework.web..")
                .because("Application use-cases must not depend on HTTP transport");

        rule.check(classes);
    }

    @Test
    @DisplayName("Presentation layer does not access repositories directly")
    void presentationDoesNotAccessRepositoriesDirectly() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("com.casciz.commerceos.presentation..")
                .should().dependOnClassesThat()
                .resideInAPackage("com.casciz.commerceos.domain..repository..")
                .because("Controllers must go through the application (use-case) layer");

        rule.check(classes);
    }
}
