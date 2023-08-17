<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20230811134647 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_travel (user_id INT NOT NULL, travel_id INT NOT NULL, INDEX IDX_485970F3A76ED395 (user_id), INDEX IDX_485970F3ECAB15B3 (travel_id), PRIMARY KEY(user_id, travel_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE user_travel ADD CONSTRAINT FK_485970F3A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_travel ADD CONSTRAINT FK_485970F3ECAB15B3 FOREIGN KEY (travel_id) REFERENCES travel (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE travel DROP FOREIGN KEY FK_2D0B6BCEA76ED395');
        $this->addSql('DROP INDEX IDX_2D0B6BCEA76ED395 ON travel');
        $this->addSql('ALTER TABLE travel DROP user_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_travel DROP FOREIGN KEY FK_485970F3A76ED395');
        $this->addSql('ALTER TABLE user_travel DROP FOREIGN KEY FK_485970F3ECAB15B3');
        $this->addSql('DROP TABLE user_travel');
        $this->addSql('ALTER TABLE travel ADD user_id INT NOT NULL');
        $this->addSql('ALTER TABLE travel ADD CONSTRAINT FK_2D0B6BCEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_2D0B6BCEA76ED395 ON travel (user_id)');
    }
}
